"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabGapAnalysis({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "gap",
    !!job?.artifacts.gapPath
  );

  if (!job) return <EmptyPane />;

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Gap analysis not generated yet."
      emptyNote="Maps every JD requirement to your real experience · names gaps · no fabrication"
      generateLabel="Generate Gap Analysis"
      onGenerate={() => generate(false)}
      onRegenerate={() => generate(true)}
    >
      {content && <MarkdownBody content={content} />}
    </TabShell>
  );
}

function EmptyPane() {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200">
      <p className="text-sm text-zinc-400">Select a job to run gap analysis.</p>
    </div>
  );
}
