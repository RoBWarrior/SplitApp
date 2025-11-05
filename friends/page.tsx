"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsub();
  }, [router]);

  const handleAddFriend = async () => {
    if (!email) return alert("Enter an email!");

    // Search for user with that email
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return alert("No user found with that email.");

    const friendDoc = snapshot.docs[0];
    const friendId = friendDoc.id;

    // Update your friends list
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      friends: [...(user.friends || []), friendId],
    });

    alert("Friend added!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="email"
          placeholder="Enter friend’s email"
          className="border rounded-lg px-3 py-2 flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleAddFriend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Friend
        </button>
      </div>
      <div>
        {friends.map((f) => (
          <p key={f.id}>{f.name}</p>
        ))}
      </div>
    </div>
  );
}
