"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabResearch({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "research",
    !!job?.artifacts.researchPath
  );

  if (!job) return <EmptyPane />;

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Research not generated yet."
      emptyNote="Answers: what product · who is the user · what is the current problem"
      generateLabel="Generate Research"
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
      <p className="text-sm text-zinc-400">Select a job to generate research.</p>
    </div>
  );
}
