import path from "path";
import fs from "fs";
import { sanitizeTextForATS } from "@/lib/careerops/ats-normalize";

// @react-pdf/renderer is server-side only — lazy import to avoid client bundle issues
export async function generateResumePdf(
  rawMarkdownContent: string,
  outputPath: string
): Promise<void> {
  // career-ops ATS normalization: strip em dashes, smart quotes, arrows, etc.
  // before rendering. The markdown structural chars (#, -, *) are ASCII and untouched.
  const markdownContent = sanitizeTextForATS(rawMarkdownContent);
  try {
    const { Document, Page, Text, View, StyleSheet, pdf, Font } = await import(
      "@react-pdf/renderer"
    );
    const { createElement } = await import("react");

    const styles = StyleSheet.create({
      page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4 },
      name: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4 },
      contact: { fontSize: 9, color: "#555", marginBottom: 12 },
      sectionTitle: {
        fontSize: 11, fontFamily: "Helvetica-Bold",
        borderBottomWidth: 1, borderBottomColor: "#000",
        paddingBottom: 2, marginTop: 12, marginBottom: 4,
      },
      bullet: { flexDirection: "row", marginBottom: 2 },
      bulletDot: { width: 14, color: "#444" },
      bulletText: { flex: 1 },
      paragraph: { marginBottom: 4 },
      bold: { fontFamily: "Helvetica-Bold" },
    });

    // Parse markdown into simple PDF elements
    const lines = markdownContent.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      if (!line.trim()) {
        elements.push(createElement(View, { key: key++, style: { marginBottom: 4 } }));
        continue;
      }

      if (line.startsWith("# ")) {
        elements.push(
          createElement(Text, { key: key++, style: styles.name }, line.slice(2))
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          createElement(Text, { key: key++, style: styles.sectionTitle }, line.slice(3).toUpperCase())
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          createElement(Text, { key: key++, style: { ...styles.paragraph, fontFamily: "Helvetica-Bold" } }, line.slice(4))
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          createElement(
            View,
            { key: key++, style: styles.bullet },
            createElement(Text, { style: styles.bulletDot }, "•"),
            createElement(Text, { style: styles.bulletText }, line.slice(2))
          )
        );
      } else {
        elements.push(
          createElement(Text, { key: key++, style: styles.paragraph }, line)
        );
      }
    }

    const doc = createElement(
      Document,
      null,
      createElement(Page, { size: "A4", style: styles.page }, ...elements)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = pdf(doc as any);
    const stream = await instance.toBuffer();
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fs.writeFileSync(outputPath, stream as any);
  } catch (err) {
    // If PDF generation fails, write a note file so the MD is still usable
    const fallbackMsg = `PDF generation failed: ${err instanceof Error ? err.message : String(err)}\n\nOpen resume.md and print to PDF from your browser.`;
    fs.writeFileSync(outputPath.replace(".pdf", "-pdf-error.txt"), fallbackMsg);
    throw err;
  }
}
