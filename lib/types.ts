export type JobRecord = {
  id: string;                 // canonical fingerprint
  company: string;
  title: string;
  location: string;
  postedDate: string;         // ISO; used by the 21-day filter
  discoveredDate: string;     // ISO
  sources: { platform: string; url: string; rawId?: string }[];
  applyUrl: string;

  tier: "A" | "B" | "C" | null;   // MANUAL. null until Dev sets it.
  fitScore?: number;               // optional sort hint only; never sets tier

  liveness: "active" | "expired" | "unknown";
  livenessCheckedAt?: string;
  ghostFlag: boolean;              // suspected repost / ghost job

  // Role-filter bucket (Phase 4). "positive" = matched a target title and was
  // auto-ingested; "maybe" = borderline (e.g. plain "Product Manager"), surfaced
  // for Dev to review, never silently dropped. Absent on manually-pasted records.
  roleBucket?: "positive" | "maybe";

  status: "discovered" | "triaged" | "building" | "applied" | "heard_back" | "skipped" | "expired";
  demoStatus: "none" | "not_started" | "in_progress" | "shipped" | "abandoned";
  appliedDate?: string;
  followups: { date: string; note: string }[];
  heardBack?: "no_response" | "rejected" | "screening" | "interview" | "offer";
  outcome?: string;

  artifacts: {                     // paths into data/jobs/<id>/
    jdText?: string;
    researchPath?: string;
    gapPath?: string;
    resumePath?: string;
    standoutPath?: string;
    outreachPath?: string;
    interviewPath?: string;
  };
  notes?: string;
};

export type SeenLedger = {
  fingerprints: string[];
  sourceIds: Record<string, string[]>; // platform -> rawIds
  // normalized "company|title" -> times seen across runs. Used by ghost/repost
  // detection: a posting whose company+title we have seen before but arrives with
  // a new fingerprint is a likely repost.
  roleHistory?: Record<string, number>;
};
