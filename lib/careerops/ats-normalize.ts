/**
 * ATS text normalizer — ported from career-ops generate-pdf.mjs `sanitizeText`.
 *
 * career-ops's full version masks HTML/CSS first; we render the resume from markdown
 * text via @react-pdf/renderer, so we only need the plain-text sanitizer. Converts
 * problematic Unicode (em/en dashes, smart quotes, arrows, bullets, zero-width chars)
 * to ASCII that ATS parsers handle reliably. Directly serves Dev's "no em dashes" rule:
 * even if the model emits one, it never reaches the PDF.
 */
export function sanitizeTextForATS(text: string): string {
  if (!text) return text;
  let t = text;
  t = t.replace(/—/g, "-"); // em dash
  t = t.replace(/–/g, "-"); // en dash
  t = t.replace(/[“”„‟]/g, '"'); // smart double quotes
  t = t.replace(/[‘’‚‛]/g, "'"); // smart single quotes
  t = t.replace(/…/g, "..."); // ellipsis
  t = t.replace(/[​‌‍⁠﻿]/g, ""); // zero-width
  t = t.replace(/ /g, " "); // nbsp
  t = t.replace(/\s*→\s*/g, " to "); // right arrow
  t = t.replace(/\s*←\s*/g, " from "); // left arrow
  t = t.replace(/\s*[↑↓]\s*/g, " "); // vertical arrows
  t = t.replace(/\s*·\s*/g, " | "); // middle dot
  t = t.replace(/€/g, "EUR "); // euro
  t = t.replace(/£/g, "GBP "); // pound
  return t;
}
