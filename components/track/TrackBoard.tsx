import type { JobRecord } from "@/lib/types";
import TrackGroup from "./TrackGroup";

export default function TrackBoard({ jobs }: { jobs: JobRecord[] }) {
  const building  = jobs.filter((j) => j.status === "building");
  const applied   = jobs.filter((j) => j.status === "applied");
  const heardBack = jobs.filter((j) => j.status === "heard_back");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-screen-xl px-6 py-8">
        <h1 className="mb-6 text-base font-semibold text-zinc-900">Track</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <TrackGroup
            title="Building"
            description="Demo or prep in progress before applying"
            jobs={building}
            showDemo
          />
          <TrackGroup
            title="Applied"
            description="Application submitted — waiting to hear back"
            jobs={applied}
          />
          <TrackGroup
            title="Heard Back"
            description="Response received — screening, interview, offer, or rejection"
            jobs={heardBack}
            showHeardBack
          />
        </div>
      </div>
    </div>
  );
}
