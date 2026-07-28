import { createHash } from "crypto";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function computeId(company: string, title: string, location: string): string {
  const key = [company, title, location].map(normalize).join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

export function parseRelativeDate(raw: string): string {
  const today = new Date();
  const s = raw.toLowerCase().trim();

  if (s === "today" || s === "just now") return today.toISOString();
  if (s === "yesterday") {
    today.setDate(today.getDate() - 1);
    return today.toISOString();
  }

  const days = s.match(/(\d+)\s*day/);
  if (days) {
    today.setDate(today.getDate() - parseInt(days[1]));
    return today.toISOString();
  }

  const weeks = s.match(/(\d+)\s*week/);
  if (weeks) {
    today.setDate(today.getDate() - parseInt(weeks[1]) * 7);
    return today.toISOString();
  }

  const months = s.match(/(\d+)\s*month/);
  if (months) {
    today.setMonth(today.getMonth() - parseInt(months[1]));
    return today.toISOString();
  }

  // Try parsing as a real date string
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();

  return new Date().toISOString();
}
