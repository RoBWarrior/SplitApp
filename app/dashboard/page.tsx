"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { Users, Plus, LogOut, Sparkles, TrendingUp, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const q = query(
        collection(db, "groups"),
        where("members", "array-contains", currentUser.uid)
      );

      const unsubGroups = onSnapshot(
        q,
        (snapshot) => {
          const groupList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setGroups(groupList);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching groups:", err);
          setError("Failed to load groups. Please try again.");
          setLoading(false);
        }
      );

      return () => unsubGroups();
    });

    return () => unsubAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-orange-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 flex items-center justify-center p-6">
        <div className="bg-red-950/50 border border-red-500/20 rounded-2xl p-6 max-w-md backdrop-blur-xl">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text">
                Your Groups
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Manage and explore your communities</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Groups</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">{groups.length}</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Active Today</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">{groups.length > 0 ? groups.length : 0}</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/groups/new")}
              className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-orange-100 text-sm font-medium">Create New</p>
                  <p className="text-2xl font-bold text-white mt-1">Group</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">No groups yet</h3>
            <p className="text-zinc-500 mb-6">Start your journey by creating or joining a group!</p>
            <button
              onClick={() => router.push("/groups/new")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-5 h-5" />
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group, index) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group block bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-orange-500/50 hover:bg-zinc-900/70 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/10"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-orange-400 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 px-6 py-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 text-zinc-400 rounded-xl hover:border-red-500/50 hover:text-red-400 hover:bg-zinc-900/70 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}