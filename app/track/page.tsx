export const dynamic = "force-dynamic";

import { getAllJobs } from "@/lib/data";
import TrackBoard from "@/components/track/TrackBoard";

export default function TrackPage() {
  const jobs = getAllJobs();
  return <TrackBoard jobs={jobs} />;
}
