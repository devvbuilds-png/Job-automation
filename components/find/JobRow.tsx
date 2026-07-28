import type { JobRecord } from "@/lib/types";
import TierBadge from "@/components/shared/TierBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import LivenessBadge from "@/components/shared/LivenessBadge";

type Props = {
  job: JobRecord;
  selected: boolean;
  onClick: () => void;
};

export default function JobRow({ job, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-zinc-50 ${
        selected ? "bg-zinc-100" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <TierBadge tier={job.tier} />
            <span className="truncate text-sm font-medium text-zinc-900">
              {job.title}
            </span>
            {job.roleBucket === "maybe" && (
              <span className="shrink-0 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-600 ring-1 ring-orange-200">
                Maybe
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={job.status} />
          <LivenessBadge liveness={job.liveness} ghost={job.ghostFlag} />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400">
        <span>{job.postedDate.slice(0, 10)}</span>
        {job.sources[0] && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5">
            {job.sources[0].platform}
          </span>
        )}
      </div>
    </button>
  );
}
