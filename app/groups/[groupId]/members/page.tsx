"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function MembersPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const groupRef = doc(db, "groups", groupId as string);
        const snapshot = await getDoc(groupRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setGroup({ id: snapshot.id, ...data });

          const memberDocs = await Promise.all(
            (data.members || []).map(async (uid: string) => {
              const userSnap = await getDoc(doc(db, "users", uid));
              if (userSnap.exists()) return { uid, ...userSnap.data() };
              return { uid, name: "Unknown User" };
            })
          );
          setMembers(memberDocs);
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, [groupId]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!group) return <div className="p-6 text-red-500">Group not found.</div>;

  const isAdmin = group.admins?.includes(currentUser?.uid);

  // Invite member
  const handleInvite = async () => {
    const link = `${window.location.origin}/groups/join?groupId=${groupId}`;
    await navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Group Members</h1>
        <Button onClick={handleInvite} className="bg-green-600 text-white">
          + Invite Members
        </Button>
      </div>

      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.uid}
            className="flex justify-between items-center bg-gray-50 p-3 rounded border"
          >
            <span>
              {m.name}{" "}
              {group.createdBy === m.uid && (
                <span className="text-blue-600 text-sm ml-1">(Creator)</span>
              )}
              {(group.admins || []).includes(m.uid) && (
                <span className="text-green-600 text-sm ml-1">(Admin)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
