"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JobRecord } from "@/lib/types";
import JobRow from "./JobRow";
import JobDetail from "./JobDetail";

export default function FindScreen({ jobs }: { jobs: JobRecord[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasting, setPasting] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);

  const selected = jobs.find((j) => j.id === selectedId) ?? null;

  async function handlePaste(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteUrl.trim()) return;
    setPasting(true);
    setPasteError(null);
    try {
      const res = await fetch("/api/intake/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pasteUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasteError(data.error ?? "Something went wrong.");
        return;
      }
      setPasteUrl("");
      setPasteOpen(false);
      const newId: string = data.job.id;
      startTransition(() => {
        router.refresh();
      });
      setSelectedId(newId);
    } catch {
      setPasteError("Network error — is the dev server running?");
    } finally {
      setPasting(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Left: job list */}
      <div className="flex w-80 flex-col border-r border-zinc-200 bg-white xl:w-96">
        {/* List header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <span className="text-sm font-medium text-zinc-800">
            {jobs.length === 0 ? "No jobs" : `${jobs.length} job${jobs.length === 1 ? "" : "s"}`}
          </span>
          <button
            onClick={() => { setPasteOpen((o) => !o); setPasteError(null); }}
            className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            {pasteOpen ? "Cancel" : "+ Add job"}
          </button>
        </div>

        {/* Paste input */}
        {pasteOpen && (
          <form onSubmit={handlePaste} className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
            <p className="mb-2 text-xs text-zinc-500">Paste a job listing URL:</p>
            <input
              type="url"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="https://jobs.lever.co/..."
              autoFocus
              className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
            {pasteError && (
              <p className="mt-1.5 text-xs text-red-500">{pasteError}</p>
            )}
            <button
              type="submit"
              disabled={pasting || !pasteUrl.trim()}
              className="mt-2 w-full rounded bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-40"
            >
              {pasting ? "Fetching…" : "Import job"}
            </button>
          </form>
        )}

        {/* Rows or empty state */}
        <div className="flex-1 overflow-y-auto">
          {isPending && (
            <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-xs text-zinc-400">
              Refreshing list…
            </div>
          )}
          {jobs.length === 0 && !isPending ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="rounded-full bg-zinc-100 p-3">
                <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500">No jobs yet.</p>
              <p className="text-xs text-zinc-400">Click "+ Add job" to paste a URL.</p>
              <button
                onClick={() => setSelectedId("__preview")}
                className="mt-2 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
              >
                Preview detail layout →
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                selected={selectedId === job.id}
                onClick={() => setSelectedId(job.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: detail pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedId === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">Select a job to view details.</p>
          </div>
        ) : (
          <JobDetail job={selected} />
        )}
      </div>
    </div>
  );
}
