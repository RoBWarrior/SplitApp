// app/groups/join/page.tsx

import { Suspense } from "react";
import JoinGroup from "./JoinGroup";

export const dynamic = "force-dynamic";

export default function JoinGroupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <JoinGroup />
    </Suspense>
  );
}
