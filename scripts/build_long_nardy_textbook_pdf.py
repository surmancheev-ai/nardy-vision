from __future__ import annotations

from html import escape
from pathlib import Path
import re

from lxml import html as lxml_html
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE_HTML = ROOT / "content" / "long_nardy_textbook.html"
OUTPUT_PDF = ROOT / "content" / "long_nardy_textbook.pdf"


def collapse(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def register_fonts() -> tuple[str, str]:
    candidates = [
        (
            str(
                Path.home()
                / "AppData"
                / "Local"
                / "Python"
                / "pythoncore-3.14-64"
                / "Lib"
                / "site-packages"
                / "reportlab"
                / "fonts"
                / "Vera.ttf"
            ),
            str(
                Path.home()
                / "AppData"
                / "Local"
                / "Python"
                / "pythoncore-3.14-64"
                / "Lib"
                / "site-packages"
                / "reportlab"
                / "fonts"
                / "VeraBd.ttf"
            ),
        ),
        ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
        ("C:/Windows/Fonts/tahoma.ttf", "C:/Windows/Fonts/tahomabd.ttf"),
    ]

    for regular_path, bold_path in candidates:
      regular = Path(regular_path)
      bold = Path(bold_path)
      if regular.exists() and bold.exists():
          pdfmetrics.registerFont(TTFont("TextbookRegular", str(regular)))
          pdfmetrics.registerFont(TTFont("TextbookBold", str(bold)))
          return "TextbookRegular", "TextbookBold"

    return "Helvetica", "Helvetica-Bold"


def build_styles():
    regular_font, bold_font = register_fonts()
    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="BookTitle",
            parent=styles["Title"],
            fontName=bold_font,
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#171717"),
            alignment=TA_CENTER,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ChapterEyebrow",
            parent=styles["BodyText"],
            fontName=bold_font,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#8d622d"),
            alignment=TA_CENTER,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ChapterTitle",
            parent=styles["Heading1"],
            fontName=bold_font,
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#171717"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Lead",
            parent=styles["BodyText"],
            fontName=regular_font,
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#33433b"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName=regular_font,
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#1d241f"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Subheading",
            parent=styles["Heading2"],
            fontName=bold_font,
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#203428"),
            spaceBefore=8,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReaderBullet",
            parent=styles["BodyText"],
            fontName=regular_font,
            fontSize=10,
            leading=15,
            leftIndent=14,
            firstLineIndent=-8,
            bulletIndent=0,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="NoteTitle",
            parent=styles["BodyText"],
            fontName=bold_font,
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#355f84"),
            spaceAfter=3,
        )
    )

    return styles


def paragraph(text: str, style_name: str, styles, story):
    clean = collapse(text)
    if clean:
        story.append(Paragraph(escape(clean), styles[style_name]))


def append_list(element, styles, story):
    for item in element.xpath("./li"):
        text = collapse(item.text_content())
        if text:
            story.append(Paragraph(escape(text), styles["ReaderBullet"], bulletText="•"))


def append_table(table_element, styles, story):
    rows = []
    for row in table_element.xpath(".//tr"):
        cells = [collapse(cell.text_content()) for cell in row.xpath("./th|./td")]
        if any(cells):
            rows.append(cells)

    if not rows:
        return

    width = 180 * mm
    col_count = max(len(row) for row in rows)
    col_width = width / max(col_count, 1)

    table = Table(rows, colWidths=[col_width] * col_count, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "TextbookBold"),
                ("FONTNAME", (0, 1), (-1, -1), "TextbookRegular"),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f4ecdf")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#7f5f31")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#d9cfbd")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.4),
                ("LEADING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 6))


def append_note(element, styles, story):
    title = collapse(" ".join(element.xpath(".//*[contains(@class, 'note-title')]/text()")))
    body = collapse(
        " ".join(
            node.text_content()
            for node in element.xpath(".//*[contains(@class, 'note-body')]/*")
        )
    )
    paragraph(title, "NoteTitle", styles, story)
    paragraph(body, "Body", styles, story)


def append_card_like(element, styles, story):
    heading = collapse(" ".join(element.xpath("./h4/text()")))
    if heading:
        story.append(Paragraph(escape(heading), styles["Subheading"]))

    for child in element:
        if child.tag == "h4":
            continue
        append_block(child, styles, story)


def append_block(element, styles, story):
    tag = element.tag.lower()
    classes = set((element.get("class") or "").split())

    if tag == "p":
      paragraph(element.text_content(), "Body", styles, story)
      return

    if tag == "h3" or tag == "h4":
      paragraph(element.text_content(), "Subheading", styles, story)
      return

    if tag in {"ul", "ol"}:
      append_list(element, styles, story)
      return

    if tag == "table":
      append_table(element, styles, story)
      return

    if "table-wrap" in classes:
      table = element.xpath(".//table")
      if table:
          append_table(table[0], styles, story)
      return

    if "note" in classes:
      append_note(element, styles, story)
      return

    if "card-grid" in classes:
      for child in element:
          append_block(child, styles, story)
      return

    if "card" in classes or "home-board-card" in classes:
      append_card_like(element, styles, story)
      return

    if tag == "details" and "exercise" in classes:
      summary = collapse(" ".join(element.xpath("./summary/text()")))
      if summary:
          paragraph(summary, "Subheading", styles, story)
      for child in element.xpath(".//*[contains(@class, 'exercise-body')]/*"):
          append_block(child, styles, story)
      return

    if "visual-gallery" in classes:
      paragraph(
          "Галерея практических изображений доступна в online-reader внутри платформы.",
          "Body",
          styles,
          story,
      )
      return

    for child in element:
      append_block(child, styles, story)


def build_story():
    styles = build_styles()
    root = lxml_html.fromstring(SOURCE_HTML.read_text(encoding="utf-8"))
    story = []

    story.append(Paragraph("Длинные нарды. Практическое руководство", styles["BookTitle"]))
    story.append(
        Paragraph(
            "Компактная PDF-версия для личного использования внутри платформы.",
            styles["Lead"],
        )
    )
    story.append(Spacer(1, 8))

    sections = root.xpath("//section[contains(@class, 'section')]")

    for index, section in enumerate(sections):
        chapter_label = collapse(
            " ".join(section.xpath(".//*[contains(@class, 'eyebrow')]/text()"))
        )
        title = collapse(" ".join(section.xpath("./div[contains(@class, 'section-head')]/h2/text()")))
        lead = collapse(" ".join(section.xpath("./p[contains(@class, 'lead')]/text()")))

        if chapter_label:
            story.append(Paragraph(escape(chapter_label), styles["ChapterEyebrow"]))
        if title:
            story.append(Paragraph(escape(title), styles["ChapterTitle"]))
        if lead:
            story.append(Paragraph(escape(lead), styles["Lead"]))

        for child in section:
            child_classes = set((child.get("class") or "").split())
            if "section-head" in child_classes:
                continue
            if child.tag.lower() == "p" and "lead" in child_classes:
                continue
            append_block(child, styles, story)

        if index != len(sections) - 1:
            story.append(PageBreak())

    return story


def build_pdf():
    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Длинные нарды. Практическое руководство",
        author="Nardy Vision",
        pageCompression=1,
    )
    story = build_story()
    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT_PDF)
