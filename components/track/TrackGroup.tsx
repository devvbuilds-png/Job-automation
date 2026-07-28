"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JobRecord } from "@/lib/types";
import TierBadge from "@/components/shared/TierBadge";
import StatusBadge from "@/components/shared/StatusBadge";

const HEARD_BACK_OPTIONS: NonNullable<JobRecord["heardBack"]>[] = [
  "no_response", "rejected", "screening", "interview", "offer",
];
const HEARD_BACK_LABELS: Record<NonNullable<JobRecord["heardBack"]>, string> = {
  no_response: "No response", rejected: "Rejected",
  screening: "Screening", interview: "Interview", offer: "Offer 🎉",
};

const DEMO_OPTIONS: JobRecord["demoStatus"][] = [
  "none", "not_started", "in_progress", "shipped", "abandoned",
];
const DEMO_LABELS: Record<JobRecord["demoStatus"], string> = {
  none: "No demo", not_started: "Not started", in_progress: "In progress",
  shipped: "Shipped", abandoned: "Abandoned",
};

type Props = {
  title: string;
  description: string;
  jobs: JobRecord[];
  showHeardBack?: boolean;
  showDemo?: boolean;
};

function TrackCard({ job, showHeardBack, showDemo }: {
  job: JobRecord;
  showHeardBack?: boolean;
  showDemo?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  async function patch(fields: Partial<JobRecord>) {
    await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-start gap-3">
        <TierBadge tier={job.tier} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900">{job.title}</p>
          <p className="truncate text-xs text-zinc-500">{job.company} · {job.location}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {job.appliedDate && (
          <span className="text-xs text-zinc-400">
            Applied {job.appliedDate.slice(0, 10)}
          </span>
        )}

        {showDemo && (
          <div className="flex items-center gap-1.5">
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
        )}

        {showHeardBack && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400">Outcome</span>
            <select
              value={job.heardBack ?? ""}
              onChange={(e) => patch({ heardBack: e.target.value as JobRecord["heardBack"] })}
              className="rounded border border-zinc-200 bg-white py-0.5 pl-2 pr-6 text-xs text-zinc-700 focus:border-zinc-400 focus:outline-none"
            >
              <option value="">—</option>
              {HEARD_BACK_OPTIONS.map((h) => (
                <option key={h} value={h}>{HEARD_BACK_LABELS[h]}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackGroup({ title, description, jobs, showHeardBack, showDemo }: Props) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-zinc-800">{title}</h2>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      {jobs.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-zinc-200">
          <p className="text-xs text-zinc-400">Nothing here yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <TrackCard
              key={job.id}
              job={job}
              showHeardBack={showHeardBack}
              showDemo={showDemo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
