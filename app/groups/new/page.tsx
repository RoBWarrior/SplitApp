"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewGroup() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const docRef = await addDoc(collection(db, "groups"), {
      name,
      members: [user.uid],
      createdAt: new Date(),
    });

    router.push(`/groups/${docRef.id}`);
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-semibold mb-4">Create a New Group</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded-lg w-72"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Create
        </button>
      </form>
    </div>
  );
}
