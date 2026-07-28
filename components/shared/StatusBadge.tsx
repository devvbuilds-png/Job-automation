import type { JobRecord } from "@/lib/types";

type Status = JobRecord["status"];

const styles: Record<Status, string> = {
  discovered: "bg-zinc-100 text-zinc-500",
  triaged:    "bg-sky-50 text-sky-700",
  building:   "bg-violet-50 text-violet-700",
  applied:    "bg-green-50 text-green-700",
  heard_back: "bg-amber-50 text-amber-700",
  skipped:    "bg-zinc-100 text-zinc-400",
  expired:    "bg-red-50 text-red-400",
};

const labels: Record<Status, string> = {
  discovered: "Discovered",
  triaged:    "Triaged",
  building:   "Building",
  applied:    "Applied",
  heard_back: "Heard Back",
  skipped:    "Skipped",
  expired:    "Expired",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
