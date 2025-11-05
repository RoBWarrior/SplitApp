"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-20 px-4">
      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-sm text-center">
        <img
          src={user.photoURL || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100"
        />
        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
        <p className="text-gray-600">{user.email}</p>

        <div className="mt-4 border-t pt-3 text-sm text-gray-500">
          <p>UID: <span className="font-mono text-gray-700">{user.uid}</span></p>
          <p>Joined on: {user.metadata.creationTime}</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
