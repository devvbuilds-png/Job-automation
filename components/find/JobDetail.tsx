"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JobRecord } from "@/lib/types";
import LivenessBadge from "@/components/shared/LivenessBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import TabJobDescription from "./tabs/TabJobDescription";
import TabResearch from "./tabs/TabResearch";
import TabGapAnalysis from "./tabs/TabGapAnalysis";
import TabResumeModifier from "./tabs/TabResumeModifier";
import TabStandOut from "./tabs/TabStandOut";
import TabOutreach from "./tabs/TabOutreach";
import TabInterview from "./tabs/TabInterview";

type Tab = "jd" | "research" | "gap" | "resume" | "standout" | "outreach" | "interview";

const ALWAYS_ON_TABS: { id: Tab; label: string }[] = [
  { id: "jd",       label: "Job Description" },
  { id: "research", label: "Company & Product Research" },
  { id: "gap",      label: "Gap Analysis" },
  { id: "resume",   label: "Resume Modifier" },
  { id: "standout", label: "Stand Out From the Crowd" },
  { id: "outreach", label: "Outreach" },
];

const STATUS_OPTIONS: JobRecord["status"][] = [
  "discovered", "triaged", "building", "applied", "heard_back", "skipped", "expired",
];
const STATUS_LABELS: Record<JobRecord["status"], string> = {
  discovered: "Discovered", triaged: "Triaged", building: "Building",
  applied: "Applied", heard_back: "Heard Back", skipped: "Skipped", expired: "Expired",
};

const DEMO_OPTIONS: JobRecord["demoStatus"][] = [
  "none", "not_started", "in_progress", "shipped", "abandoned",
];
const DEMO_LABELS: Record<JobRecord["demoStatus"], string> = {
  none: "No demo", not_started: "Not started", in_progress: "In progress",
  shipped: "Shipped", abandoned: "Abandoned",
};

export default function JobDetail({ job: initialJob }: { job: JobRecord | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("jd");
  const [job, setJob] = useState<JobRecord | null>(initialJob);
  const [saving, setSaving] = useState(false);

  // Sync prop changes (after router.refresh)
  if (initialJob && initialJob !== job && initialJob.id === job?.id) {
    setJob(initialJob);
  }
  if (initialJob?.id !== job?.id) {
    setJob(initialJob);
    setActiveTab("jd");
  }

  async function patch(fields: Partial<JobRecord>) {
    if (!job) return;
    // Optimistic update
    setJob({ ...job, ...fields });
    setSaving(true);
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  const tabs =
    job?.status === "heard_back"
      ? [...ALWAYS_ON_TABS, { id: "interview" as Tab, label: "Interview & Offer" }]
      : ALWAYS_ON_TABS;

  const safeTab = tabs.find((t) => t.id === activeTab) ? activeTab : "jd";

  return (
    <div className="flex h-full flex-col">
      {/* Job header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        {job ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold leading-snug text-zinc-900">{job.title}</h2>
                <p className="text-sm text-zinc-500">{job.company} · {job.location}</p>
              </div>
              <div className="flex items-center gap-2">
                {saving && <span className="text-xs text-zinc-400">Saving…</span>}
                <LivenessBadge liveness={job.liveness} ghost={job.ghostFlag} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Tier selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Tier</span>
                <div className="flex gap-1">
                  {(["A", "B", "C"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => patch({ tier: job.tier === t ? null : t })}
                      className={`h-6 w-6 rounded text-xs font-bold ring-1 transition-colors ${
                        job.tier === t
                          ? t === "A" ? "bg-amber-50 text-amber-700 ring-amber-300"
                          : t === "B" ? "bg-sky-50 text-sky-700 ring-sky-300"
                          : "bg-zinc-200 text-zinc-600 ring-zinc-300"
                          : "bg-white text-zinc-300 ring-zinc-200 hover:ring-zinc-300 hover:text-zinc-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Status</span>
                <select
                  value={job.status}
                  onChange={(e) => patch({ status: e.target.value as JobRecord["status"] })}
                  className="rounded border border-zinc-200 bg-white py-0.5 pl-2 pr-6 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Demo status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Demo</span>
                <select
                  value={job.demoStatus}
                  onChange={(e) => patch({ demoStatus: e.target.value as JobRecord["demoStatus"] })}
                  className="rounded border border-zinc-200 bg-white py-0.5 pl-2 pr-6 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none"
                >
                  {DEMO_OPTIONS.map((d) => (
                    <option key={d} value={d}>{DEMO_LABELS[d]}</option>
                  ))}
                </select>
              </div>

              <div className="ml-auto flex items-center gap-3 text-xs text-zinc-400">
                <StatusBadge status={job.status} />
                <span>Posted {job.postedDate.slice(0, 10)}</span>
                {job.sources[0] && (
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-500">
                    {job.sources[0].platform}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-zinc-400">Preview — no job selected</h2>
            <p className="text-sm text-zinc-400">Tab structure shown below.</p>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="border-b border-zinc-200 bg-white px-6">
        <div className="flex overflow-x-auto">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                safeTab === id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 p-6">
        {safeTab === "jd"        && <TabJobDescription job={job} />}
        {safeTab === "research"  && <TabResearch job={job} />}
        {safeTab === "gap"       && <TabGapAnalysis job={job} />}
        {safeTab === "resume"    && <TabResumeModifier job={job} />}
        {safeTab === "standout"  && <TabStandOut job={job} />}
        {safeTab === "outreach"  && <TabOutreach job={job} />}
        {safeTab === "interview" && job?.status === "heard_back" && <TabInterview job={job} />}
      </div>
    </div>
  );
}
