from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps


@dataclass(frozen=True)
class NormalizedRect:
    left: float
    top: float
    right: float
    bottom: float

    def scale(self, image_size: tuple[int, int]) -> tuple[int, int, int, int]:
        width, height = image_size
        return (
            int(round(self.left * width)),
            int(round(self.top * height)),
            int(round(self.right * width)),
            int(round(self.bottom * height)),
        )


STATUS_REGION = NormalizedRect(0.0, 0.05, 0.14, 0.224)
PROGRESS_REGION = NormalizedRect(0.0, 0.095, 0.12, 0.17)

NUMBER_PATTERN = re.compile(r"[+-]?\d+(?:[.,]\d+)?%?")
TIMER_PATTERN = re.compile(r"\b\d{1,2}:\d{2}\b")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect LogasAI analysis progress and parse summary metrics.")
    parser.add_argument("--image", required=True, help="Path to a LogasAI screenshot.")
    parser.add_argument("--output-json", help="Optional JSON output path.")
    parser.add_argument("--debug-dir", help="Optional directory for cropped/preprocessed debug images.")
    return parser.parse_args()


def crop_region(image: Image.Image, rect: NormalizedRect) -> Image.Image:
    return image.crop(rect.scale(image.size))


def prepare_variants(image: Image.Image) -> dict[str, Image.Image]:
    gray = image.convert("L")
    gray = ImageOps.autocontrast(gray)

    variants = {
        "original_x1": image,
        "original_x4": image.resize((image.width * 4, image.height * 4), Image.Resampling.LANCZOS),
        "gray_x4": gray.resize((gray.width * 4, gray.height * 4), Image.Resampling.LANCZOS),
        "gray_x6": gray.resize((gray.width * 6, gray.height * 6), Image.Resampling.LANCZOS),
    }

    bw170 = gray.point(lambda p: 255 if p > 170 else 0)
    bw145 = gray.point(lambda p: 255 if p > 145 else 0)
    inv145 = ImageOps.invert(bw145)

    variants["bw170_x6"] = bw170.resize((bw170.width * 6, bw170.height * 6), Image.Resampling.NEAREST)
    variants["bw145_x6"] = bw145.resize((bw145.width * 6, bw145.height * 6), Image.Resampling.NEAREST)
    variants["inv145_x6"] = inv145.resize((inv145.width * 6, inv145.height * 6), Image.Resampling.NEAREST)
    return variants


def save_debug_variants(base_name: str, variants: dict[str, Image.Image], debug_dir: Path | None) -> dict[str, str]:
    paths: dict[str, str] = {}
    if debug_dir is None:
        return paths
    debug_dir.mkdir(parents=True, exist_ok=True)
    for variant_name, variant in variants.items():
        output_path = debug_dir / f"{base_name}_{variant_name}.png"
        variant.save(output_path)
        paths[variant_name] = str(output_path)
    return paths


def run_windows_ocr(image_path: Path) -> dict:
    script_path = Path(__file__).with_name("windows-ocr.ps1")
    process = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script_path),
            "-ImagePath",
            str(image_path),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    return json.loads(process.stdout)


def choose_best_ocr(variant_payloads: dict[str, dict], *, complete_hint: bool) -> tuple[str, dict]:
    best_name = ""
    best_payload: dict = {}
    best_score = -10_000

    for variant_name, payload in variant_payloads.items():
        text = (payload.get("text") or "").strip()
        tokens = NUMBER_PATTERN.findall(text)
        score = len(tokens) * 10
        if TIMER_PATTERN.search(text):
            score += 20
        if "%" in text:
            score += 10
        if complete_hint and len(payload.get("lines") or []) >= 2:
            score += 8
        if complete_hint and any(token.startswith(("+", "-")) for token in tokens):
            score += 15
        if not complete_hint and TIMER_PATTERN.search(text):
            score += 15
        if score > best_score:
            best_name = variant_name
            best_payload = payload
            best_score = score

    return best_name, best_payload


def parse_metric_tokens(text: str) -> list[str]:
    return NUMBER_PATTERN.findall(text.replace(" ", ""))


def classify_state(status_text: str, master_tokens: list[str], human_tokens: list[str], *, non_white_ratio: float) -> str:
    if TIMER_PATTERN.search(status_text) or "%" in status_text:
        return "running"
    if len(master_tokens) + len(human_tokens) >= 2 or non_white_ratio >= 0.82:
        return "complete"
    return "running"


def compute_visual_summary(image: Image.Image) -> dict[str, float]:
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    dark_ratio = float((gray < 90).mean())
    non_white_ratio = float((gray < 245).mean())
    return {
        "dark_ratio": round(dark_ratio, 6),
        "non_white_ratio": round(non_white_ratio, 6),
    }


def collect_variant_payloads(debug_paths: dict[str, str]) -> dict[str, dict]:
    payloads: dict[str, dict] = {}
    for name, path in debug_paths.items():
        payload = run_windows_ocr(Path(path))
        with Image.open(path) as image:
            payload["_image_width"] = image.width
            payload["_image_height"] = image.height
        payloads[name] = payload
    return payloads


def normalize_numeric_token(token: str) -> str:
    replacements = {
        "О": "0",
        "о": "0",
        "O": "0",
        "o": "0",
        "З": "3",
        "з": "3",
        "S": "5",
        "ј": "",
        ";": "",
        ":": "",
        "?": "",
        "[": "-",
        "]": "",
        "(": "",
        ")": "",
        "_": "",
    }
    normalized = token.strip()
    for source, target in replacements.items():
        normalized = normalized.replace(source, target)

    if normalized.endswith("$"):
        normalized = normalized[:-1] + ",6"

    normalized = re.sub(r"[^0-9+,\-.%]", "", normalized)
    normalized = normalized.replace(".", ",")

    if (
        "," not in normalized
        and "%" not in normalized
        and ":" not in normalized
        and re.fullmatch(r"[+-]?\d{2,3}", normalized)
    ):
        sign = ""
        digits = normalized
        if digits[0] in "+-":
            sign = digits[0]
            digits = digits[1:]
        normalized = f"{sign}{digits[:-1]},{digits[-1]}"

    if normalized.count(",") > 1:
        first, *rest = normalized.split(",")
        normalized = first + "," + "".join(rest)

    return normalized


def collect_column_tokens(variant_payloads: dict[str, dict]) -> tuple[list[str], list[str]]:
    candidates = {"master": [], "human": []}

    for payload in variant_payloads.values():
        image_width = payload.get("_image_width") or 1
        image_height = payload.get("_image_height") or 1
        for line in payload.get("lines") or []:
            for word in line.get("words") or []:
                raw_token = (word.get("text") or "").strip()
                if not raw_token:
                    continue
                normalized = normalize_numeric_token(raw_token)
                if not NUMBER_PATTERN.fullmatch(normalized):
                    continue
                if "," not in normalized and "%" not in normalized:
                    continue

                bounds = word.get("bounds") or {}
                center_x = (bounds.get("x", 0) + (bounds.get("width", 0) / 2)) / image_width
                center_y = (bounds.get("y", 0) + (bounds.get("height", 0) / 2)) / image_height
                column = "master" if center_x < 0.5 else "human"
                score = len(normalized)
                if normalized.startswith(("+", "-")):
                    score += 10
                if "," in normalized:
                    score += 8
                if normalized.endswith("%"):
                    score += 5

                candidates[column].append(
                    {
                        "token": normalized,
                        "y": center_y,
                        "score": score,
                    }
                )

    def collapse(column_candidates: list[dict]) -> list[str]:
        rows: list[dict] = []
        for candidate in sorted(column_candidates, key=lambda item: item["y"]):
            for row in rows:
                if abs(row["y"] - candidate["y"]) < 0.07:
                    row["items"].append(candidate)
                    row["y"] = min(row["y"], candidate["y"])
                    break
            else:
                rows.append({"y": candidate["y"], "items": [candidate]})

        values: list[str] = []
        for row in rows:
            best_item = sorted(
                row["items"],
                key=lambda item: (-item["score"], -len(item["token"]), item["token"]),
            )[0]
            values.append(best_item["token"])
        return values

    return collapse(candidates["master"]), collapse(candidates["human"])


def merge_metric_columns(primary: list[str], fallback: list[str], *, limit: int = 3) -> list[str]:
    values = list(primary)
    for token in fallback:
        if len(values) >= limit:
            break
        values.append(token)
    return values[:limit]


def analyze_image(image_path: Path, *, debug_dir: Path | None = None) -> dict:
    image = Image.open(image_path).convert("RGB")
    status_roi = crop_region(image, STATUS_REGION)
    progress_roi = crop_region(image, PROGRESS_REGION)

    status_variants = prepare_variants(status_roi)
    progress_variants = prepare_variants(progress_roi)

    status_debug_paths = save_debug_variants(f"{image_path.stem}_status", status_variants, debug_dir)
    progress_debug_paths = save_debug_variants(f"{image_path.stem}_progress", progress_variants, debug_dir)

    if not status_debug_paths:
        temp_dir = Path.cwd() / ".tmp_logasai_status"
        temp_dir.mkdir(exist_ok=True)
        status_debug_paths = save_debug_variants(f"{image_path.stem}_status", status_variants, temp_dir)
        progress_debug_paths = save_debug_variants(f"{image_path.stem}_progress", progress_variants, temp_dir)

    status_payloads = collect_variant_payloads(status_debug_paths)
    progress_payloads = collect_variant_payloads(progress_debug_paths)

    status_variant, status_payload = choose_best_ocr(status_payloads, complete_hint=True)
    progress_variant, progress_payload = choose_best_ocr(progress_payloads, complete_hint=False)
    status_text = (status_payload.get("text") or "").strip()
    progress_text = (progress_payload.get("text") or "").strip()

    master_tokens, human_tokens = collect_column_tokens(status_payloads)
    progress_master_tokens, progress_human_tokens = collect_column_tokens(progress_payloads)
    master_tokens = merge_metric_columns(master_tokens, progress_master_tokens)
    human_tokens = merge_metric_columns(human_tokens, progress_human_tokens)
    visual_summary = compute_visual_summary(status_roi)
    if TIMER_PATTERN.search(status_text) or "%" in status_text or TIMER_PATTERN.search(progress_text) or "%" in progress_text:
        state = "running"
    elif len(master_tokens) + len(human_tokens) >= 2:
        state = "complete"
    elif visual_summary["non_white_ratio"] >= 0.78:
        state = "complete"
    else:
        state = "running"

    return {
        "image_path": str(image_path.resolve()),
        "image_size": {"width": image.width, "height": image.height},
        "state": state,
        "status_region": {
            "rect": {
                "left": STATUS_REGION.scale(image.size)[0],
                "top": STATUS_REGION.scale(image.size)[1],
                "right": STATUS_REGION.scale(image.size)[2],
                "bottom": STATUS_REGION.scale(image.size)[3],
            },
            "visual": visual_summary,
            "ocr_variant": status_variant,
            "ocr_text": status_text,
            "ocr_words": status_payload.get("lines") or [],
        },
        "progress_region": {
            "rect": {
                "left": PROGRESS_REGION.scale(image.size)[0],
                "top": PROGRESS_REGION.scale(image.size)[1],
                "right": PROGRESS_REGION.scale(image.size)[2],
                "bottom": PROGRESS_REGION.scale(image.size)[3],
            },
            "ocr_variant": progress_variant,
            "ocr_text": progress_text,
        },
        "summary_metrics": {
            "master": {
                "values": master_tokens,
            },
            "human": {
                "values": human_tokens,
            },
        },
        "debug_images": {
            "status": status_debug_paths,
            "progress": progress_debug_paths,
        },
    }


def main() -> int:
    args = parse_args()
    image_path = Path(args.image)
    debug_dir = Path(args.debug_dir) if args.debug_dir else None
    analysis = analyze_image(image_path, debug_dir=debug_dir)
    payload = json.dumps(analysis, ensure_ascii=False, indent=2)

    if args.output_json:
        output_path = Path(args.output_json)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(payload + "\n", encoding="utf-8")

    print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
