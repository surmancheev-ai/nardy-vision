import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

export const LONG_NARDY_TEXTBOOK_SLUG = "long-nardy-practical";
export const LONG_NARDY_TEXTBOOK_ACCESS_TIER = "PRO" as const;
export const LONG_NARDY_TEXTBOOK_PDF_PRODUCT_CODE =
  "content-long-nardy-practical-pdf";
export const LONG_NARDY_TEXTBOOK_PDF_FILE_NAME =
  "long-nardy-practical-guide.pdf";
export const LONG_NARDY_TEXTBOOK_PDF_PATH = path.join(
  process.cwd(),
  "content",
  "long_nardy_textbook.pdf",
);
export const LONG_NARDY_TEXTBOOK_ASSETS_PATH = path.join(
  process.cwd(),
  "content",
  "practice_assets",
);
const ASSET_ROUTE_PREFIX = "/api/content/long-nardy-practical/assets";

export type ProtectedMaterialSection = {
  id: string;
  order: number;
  chapterLabel: string;
  title: string;
  excerpt: string;
  href: string;
  anchorIds: string[];
  html: string;
};

export type ProtectedMaterial = {
  slug: string;
  title: string;
  description: string;
  sectionCount: number;
  estimatedReadLabel: string;
  protectionNotes: string[];
  sections: ProtectedMaterialSection[];
};

const SOURCE_PATH = path.join(process.cwd(), "content", "long_nardy_textbook.html");

function buildAssetRoute(assetPath: string) {
  return `${ASSET_ROUTE_PREFIX}/${encodeURI(assetPath.replace(/\\/g, "/"))}`;
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, '"')
    .replace(/&raquo;/g, '"')
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&hellip;/g, "...")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMatch(input: string, pattern: RegExp, fallback: string) {
  const match = input.match(pattern);

  if (!match?.[1]) {
    return fallback;
  }

  return stripTags(match[1]);
}

function sanitizeSectionHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "");
}

function collectAnchorIds(sectionId: string, html: string) {
  const ids = new Set<string>([sectionId]);
  const idMatches = html.matchAll(/\sid="([^"]+)"/gi);

  for (const match of idMatches) {
    if (match[1]) {
      ids.add(match[1]);
    }
  }

  return Array.from(ids);
}

function buildSectionHref(sectionId: string, anchorId?: string) {
  const base = `/dashboard/library/${LONG_NARDY_TEXTBOOK_SLUG}/${sectionId}`;
  return anchorId ? `${base}#${anchorId}` : base;
}

type TempSection = Omit<ProtectedMaterialSection, "href" | "html"> & {
  rawHtml: string;
};

export const getLongNardyTextbook = cache(async (): Promise<ProtectedMaterial> => {
  const source = await readFile(SOURCE_PATH, "utf8");
  const title =
    extractMatch(source, /<title>([\s\S]*?)<\/title>/i, "Практическое руководство") ||
    "Практическое руководство";

  const sectionMatches = source.matchAll(
    /<section\s+id="([^"]+)"[^>]*class="section"[^>]*>([\s\S]*?)<\/section>/gi,
  );

  const tempSections: TempSection[] = [];

  for (const [index, match] of Array.from(sectionMatches).entries()) {
    const id = match[1];
    const rawHtml = sanitizeSectionHtml(match[2] ?? "");
    const chapterLabel = extractMatch(rawHtml, /<div class="eyebrow">([\s\S]*?)<\/div>/i, `Глава ${index + 1}`);
    const sectionTitle = extractMatch(rawHtml, /<h2[^>]*>([\s\S]*?)<\/h2>/i, `Раздел ${index + 1}`);
    const excerpt = extractMatch(rawHtml, /<p class="lead">([\s\S]*?)<\/p>/i, "Практический фрагмент руководства.");
    const anchorIds = collectAnchorIds(id, rawHtml);

    tempSections.push({
      id,
      order: index + 1,
      chapterLabel,
      title: sectionTitle,
      excerpt,
      anchorIds,
      rawHtml,
    });
  }

  const anchorIndex = new Map<string, string>();

  for (const section of tempSections) {
    for (const anchorId of section.anchorIds) {
      if (!anchorIndex.has(anchorId)) {
        anchorIndex.set(anchorId, section.id);
      }
    }
  }

  const sections = tempSections.map<ProtectedMaterialSection>((section) => ({
    id: section.id,
    order: section.order,
    chapterLabel: section.chapterLabel,
    title: section.title,
    excerpt: section.excerpt,
    anchorIds: section.anchorIds,
    href: buildSectionHref(section.id),
    html: section.rawHtml.replace(/href="#([^"]+)"/gi, (_, anchorId: string) => {
      const targetSection = anchorIndex.get(anchorId);

      if (!targetSection) {
        return 'href="#"';
      }

      return `href="${buildSectionHref(targetSection, anchorId)}"`;
    }).replace(/src="practice_assets\/([^"]+)"/gi, (_, assetPath: string) => {
      return `src="${buildAssetRoute(assetPath)}"`;
    }),
  }));

  return {
    slug: LONG_NARDY_TEXTBOOK_SLUG,
    title,
    description:
      "Практическое руководство по длинным нардам в формате защищенного reader: одна глава на экран, навигация по разделам, водяной знак и повышенный порог для копирования.",
    sectionCount: sections.length,
    estimatedReadLabel: "20 глав, таблицы, чек-листы и практикум",
    protectionNotes: [
      "Главы открываются по одной, а не одной длинной страницей.",
      "В режиме чтения отключены обычное выделение, копирование, drag-and-drop и печать.",
      "На страницу накладывается персональный водяной знак по аккаунту пользователя.",
    ],
    sections,
  };
});

export async function getLongNardyTextbookSection(sectionId: string) {
  const material = await getLongNardyTextbook();
  return material.sections.find((section) => section.id === sectionId) ?? null;
}
