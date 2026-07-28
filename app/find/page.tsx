export const dynamic = "force-dynamic";

import { getAllJobs } from "@/lib/data";
import FindScreen from "@/components/find/FindScreen";

export default function FindPage() {
  const jobs = getAllJobs();
  return <FindScreen jobs={jobs} />;
}
