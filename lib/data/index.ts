import fs from "fs";
import path from "path";
import type { JobRecord, SeenLedger } from "../types";

const JOBS_PATH = path.join(process.cwd(), "data", "jobs.json");
const SEEN_PATH = path.join(process.cwd(), "data", "seen.json");

// ── helpers ──────────────────────────────────────────────────────────────────

function readRaw(): JobRecord[] {
  const raw = fs.readFileSync(JOBS_PATH, "utf-8");
  return JSON.parse(raw) as JobRecord[];
}

function writeRaw(records: JobRecord[]): void {
  fs.writeFileSync(JOBS_PATH, JSON.stringify(records, null, 2), "utf-8");
}

// ── public API ────────────────────────────────────────────────────────────────

export function getAllJobs(): JobRecord[] {
  return readRaw();
}

export function getJobById(id: string): JobRecord | undefined {
  return readRaw().find((j) => j.id === id);
}

/**
 * Insert or replace a full record by id.
 * If a record with this id already exists it is replaced wholesale.
 */
export function upsertJob(record: JobRecord): void {
  const records = readRaw();
  const idx = records.findIndex((j) => j.id === record.id);
  if (idx === -1) {
    records.push(record);
  } else {
    records[idx] = record;
  }
  writeRaw(records);
}

/**
 * Merge a partial update into an existing record.
 * Throws if the record does not exist.
 */
export function updateJobFields(
  id: string,
  fields: Partial<JobRecord>
): JobRecord {
  const records = readRaw();
  const idx = records.findIndex((j) => j.id === id);
  if (idx === -1) throw new Error(`Job not found: ${id}`);
  records[idx] = { ...records[idx], ...fields };
  writeRaw(records);
  return records[idx];
}

// ── seen ledger ───────────────────────────────────────────────────────────────

export function readSeenLedger(): SeenLedger {
  const raw = fs.readFileSync(SEEN_PATH, "utf-8");
  return JSON.parse(raw) as SeenLedger;
}

export function writeSeenLedger(ledger: SeenLedger): void {
  fs.writeFileSync(SEEN_PATH, JSON.stringify(ledger, null, 2), "utf-8");
}
