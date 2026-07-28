"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabOutreach({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "outreach",
    !!job?.artifacts.outreachPath
  );

  if (!job) return <EmptyPane />;

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Outreach not generated yet."
      emptyNote="Who to contact · cold message or referral ask tailored to this role"
      generateLabel="Generate Outreach"
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
      <p className="text-sm text-zinc-400">Select a job to generate outreach.</p>
    </div>
  );
}
