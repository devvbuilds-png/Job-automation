"use client";
import { useState, useEffect, useRef } from "react";

type TabState = {
  content: string | null;
  status: "idle" | "loading" | "done" | "error";
  error: string | null;
};

export function useTabContent(jobId: string | undefined, endpoint: string, hasArtifact: boolean) {
  const [state, setState] = useState<TabState>({ content: null, status: "idle", error: null });
  const prevJobId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!jobId) { setState({ content: null, status: "idle", error: null }); return; }

    // Reset when job changes
    if (prevJobId.current !== jobId) {
      prevJobId.current = jobId;
      setState({ content: null, status: "idle", error: null });
    }

    if (!hasArtifact) return;

    setState((s) => ({ ...s, status: "loading" }));
    fetch(`/api/jobs/${jobId}/${endpoint}`)
      .then((r) => r.json())
      .then((data) => {
        setState({ content: data.content ?? null, status: "done", error: null });
      })
      .catch((err) => {
        setState({ content: null, status: "error", error: err.message });
      });
  }, [jobId, endpoint, hasArtifact]);

  async function generate(force = false) {
    if (!jobId) return;
    setState({ content: null, status: "loading", error: null });
    try {
      const res = await fetch(`/api/jobs/${jobId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setState({ content: data.content ?? null, status: "done", error: null });
    } catch (err) {
      setState({ content: null, status: "error", error: (err as Error).message });
    }
  }

  return { ...state, generate };
}
