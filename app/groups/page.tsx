"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, Sparkles, ArrowRight, Crown } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      const q = query(collection(db, "groups"), where("members", "array-contains", currentUser.uid));
      const snapshot = await getDocs(q);
      setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-xl opacity-60"></div>
                  <div className="relative p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-xl shadow-yellow-500/30">
                    <Crown className="w-7 h-7 text-amber-950" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text">
                    Your Groups
                  </h1>
                  <p className="text-amber-300/70 text-sm mt-1">Manage your communities</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/groups/new")}
              className="group relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl font-semibold text-amber-950 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 flex items-center gap-2 justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Create Group</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-400/40 hover:bg-zinc-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300/70 text-sm font-medium">Total Groups</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-1">{groups.length}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Users className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-400/40 hover:bg-zinc-900/70 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-300/70 text-sm font-medium">Total Members</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-1">
                    {groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Sparkles className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-xl border border-yellow-400/30 rounded-2xl p-5 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200/90 text-sm font-medium">Active Status</p>
                  <p className="text-2xl font-bold text-yellow-300 mt-1">All Connected</p>
                </div>
                <div className="p-3 bg-yellow-400/20 rounded-xl">
                  <Crown className="w-7 h-7 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-12 lg:p-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-2xl opacity-30"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                <Users className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-yellow-300 mb-3">No Groups Yet</h3>
            <p className="text-amber-300/70 mb-8 max-w-md mx-auto">
              Start your journey by creating your first group and invite your friends to join!
            </p>
            <button
              onClick={() => router.push("/groups/new")}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 rounded-xl font-bold hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              Create Your First Group
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group, index) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group block bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-400/50 hover:bg-zinc-900/60 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all">
                        <Users className="w-8 h-8 text-amber-950" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl lg:text-2xl font-bold text-yellow-300 group-hover:text-yellow-200 transition-colors mb-1 truncate">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-2 text-amber-300/70">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {group.members?.length || 0} member{group.members?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-all">
                      <ArrowRight className="w-6 h-6 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}