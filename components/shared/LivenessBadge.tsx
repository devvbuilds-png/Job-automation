import type { JobRecord } from "@/lib/types";

type Liveness = JobRecord["liveness"];

export default function LivenessBadge({
  liveness,
  ghost,
}: {
  liveness: Liveness;
  ghost: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {liveness === "active" && (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Live
        </span>
      )}
      {liveness === "expired" && (
        <span className="text-xs text-red-400">Expired</span>
      )}
      {liveness === "unknown" && (
        <span className="text-xs text-zinc-400">?</span>
      )}
      {ghost && (
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600 ring-1 ring-amber-200">
          Ghost?
        </span>
      )}
    </span>
  );
}
