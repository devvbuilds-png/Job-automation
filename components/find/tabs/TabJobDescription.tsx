"use client";
import { useEffect, useState } from "react";
import type { JobRecord } from "@/lib/types";

type LivenessState = { checked: boolean; result: JobRecord["liveness"] };

export default function TabJobDescription({ job }: { job: JobRecord | null }) {
  const [liveness, setLiveness] = useState<LivenessState>({
    checked: false,
    result: job?.liveness ?? "unknown",
  });

  useEffect(() => {
    if (!job) return;
    setLiveness({ checked: false, result: job.liveness });

    // Re-check liveness on every open
    fetch(`/api/jobs/${job.id}/liveness`, { method: "POST" })
      .then((r) => r.json())
      .then((data) => setLiveness({ checked: true, result: data.liveness }))
      .catch(() => setLiveness({ checked: true, result: "unknown" }));
  }, [job?.id]);

  if (!job) return <TabEmpty />;

  return (
    <div className="space-y-4">
      {/* Meta row */}
      <div className="flex flex-wrap items-start gap-6 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-zinc-400">Apply link</p>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sky-600 underline underline-offset-2 hover:text-sky-800"
          >
            {job.applyUrl.length > 70 ? job.applyUrl.slice(0, 70) + "…" : job.applyUrl}
          </a>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Liveness</p>
          <div className="flex items-center gap-1.5">
            {!liveness.checked && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            )}
            {liveness.result === "active" && (
              <span className="flex items-center gap-1 text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Active
              </span>
            )}
            {liveness.result === "expired" && (
              <span className="text-red-500">Expired</span>
            )}
            {liveness.result === "unknown" && liveness.checked && (
              <span className="text-zinc-400">Unknown</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Source</p>
          <p className="text-zinc-700">{job.sources[0]?.platform ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400">Posted</p>
          <p className="text-zinc-700">{job.postedDate.slice(0, 10)}</p>
        </div>
      </div>

      {job.artifacts.jdText ? (
        <JdBody text={job.artifacts.jdText} />
      ) : (
        <TabEmpty label="Job description not yet fetched." />
      )}
    </div>
  );
}

function JdBody({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-6 py-5">
      <div className="space-y-1 text-sm leading-relaxed text-zinc-700">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-3" />;

          const isSectionHead =
            trimmed.length < 80 &&
            !trimmed.endsWith(".") && !trimmed.endsWith(",") &&
            /^[A-Z]/.test(trimmed) &&
            (trimmed === trimmed.toUpperCase() ||
              /^([A-Z][a-z]+\s*)+$/.test(trimmed) ||
              /^[A-Z][a-z].*[A-Z]/.test(trimmed));

          if (isSectionHead) {
            return (
              <p key={i} className="pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 first:pt-0">
                {trimmed}
              </p>
            );
          }
          if (/^[-•*·]\s/.test(trimmed)) {
            return (
              <p key={i} className="pl-4 before:mr-2 before:text-zinc-400 before:content-['·']">
                {trimmed.replace(/^[-•*·]\s/, "")}
              </p>
            );
          }
          return <p key={i}>{trimmed}</p>;
        })}
      </div>
    </div>
  );
}

function TabEmpty({ label = "No content yet." }: { label?: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200">
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}
