"use client";

type Props = {
  status: "idle" | "loading" | "done" | "error";
  error: string | null;
  emptyLabel: string;
  emptyNote?: string;
  generateLabel?: string;
  onGenerate: () => void;
  onRegenerate?: () => void;
  children: React.ReactNode;
};

export default function TabShell({
  status,
  error,
  emptyLabel,
  emptyNote,
  generateLabel = "Generate",
  onGenerate,
  onRegenerate,
  children,
}: Props) {
  if (status === "loading") {
    return (
      <div className="flex h-48 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
        <p className="text-sm text-zinc-500">Generating — this may take 30–60 s…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">Error</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
        <button
          onClick={onGenerate}
          className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
            >
              Regenerate
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }

  // idle — show generate prompt
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-200">
      <p className="text-sm text-zinc-500">{emptyLabel}</p>
      {emptyNote && <p className="text-xs text-zinc-400">{emptyNote}</p>}
      <button
        onClick={onGenerate}
        className="mt-1 rounded bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
      >
        {generateLabel}
      </button>
    </div>
  );
}
