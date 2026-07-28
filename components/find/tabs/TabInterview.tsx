"use client";
import type { JobRecord } from "@/lib/types";
import { useTabContent } from "./useTabContent";
import TabShell from "./TabShell";
import MarkdownBody from "@/components/shared/MarkdownBody";

export default function TabInterview({ job }: { job: JobRecord | null }) {
  const { content, status, error, generate } = useTabContent(
    job?.id,
    "interview",
    !!job?.artifacts.interviewPath
  );

  if (!job) return null;

  const isOffer = job.heardBack === "offer";

  return (
    <TabShell
      status={status}
      error={error}
      emptyLabel="Interview prep not generated yet."
      emptyNote={
        isOffer
          ? "STAR prep + negotiation framing · requires Gap Analysis first"
          : "STAR behavioral prep mapped to this JD · requires Gap Analysis first"
      }
      generateLabel={isOffer ? "Generate Interview & Offer Prep" : "Generate Interview Prep"}
      onGenerate={() => generate(false)}
      onRegenerate={() => generate(true)}
    >
      {content && <MarkdownBody content={content} />}
    </TabShell>
  );
}
