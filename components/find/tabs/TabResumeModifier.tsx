"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabResumeModifier({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "resume",
    !!job?.artifacts.resumePath
  );

  if (!job) return <EmptyPane />;

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Resume not tailored yet."
      emptyNote="Reframes your master CV for this JD · ATS-friendly · no fabrication · requires resume/cv.md"
      generateLabel="Generate Tailored Resume"
      onGenerate={() => generate(false)}
      onRegenerate={() => generate(true)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            Tailored to {job.title} at {job.company}
          </p>
          <a
            href={`/api/jobs/${job.id}/resume/download`}
            download
            className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
          >
            Download PDF
          </a>
        </div>
        {content && <MarkdownBody content={content} />}
      </div>
    </TabShell>
  );
}

function EmptyPane() {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-200">
      <p className="text-sm text-zinc-400">Select a job to tailor your resume.</p>
    </div>
  );
}
