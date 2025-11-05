"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function JoinGroup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get("groupId");

  useEffect(() => {
    const join = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const groupRef = doc(db, "groups", groupId!);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
      });

      alert("You’ve joined the group!");
      router.push(`/groups/${groupId}`);
    };

    join();
  }, [groupId, router]);

  return <div className="flex justify-center items-center h-screen">Joining group...</div>;
}
