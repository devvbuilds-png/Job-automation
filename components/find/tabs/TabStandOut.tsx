"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabStandOut({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "standout",
    !!job?.artifacts.standoutPath
  );

  if (!job) return <EmptyPane />;

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Stand-out plan not generated yet."
      emptyNote="Requires Research + Gap Analysis to be generated first"
      generateLabel="Generate Stand-Out Plan"
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
      <p className="text-sm text-zinc-400">Select a job to generate a stand-out plan.</p>
    </div>
  );
}
