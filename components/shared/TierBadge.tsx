import type { JobRecord } from "@/lib/types";

type Tier = JobRecord["tier"];

const styles: Record<NonNullable<Tier>, string> = {
  A: "bg-amber-50 text-amber-700 ring-amber-200",
  B: "bg-sky-50 text-sky-700 ring-sky-200",
  C: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

export default function TierBadge({ tier }: { tier: Tier }) {
  if (!tier)
    return <span className="text-xs text-zinc-300">—</span>;
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded text-xs font-bold ring-1 ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}
