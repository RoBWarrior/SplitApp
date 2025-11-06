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
import { Users, Link as LinkIcon, Crown, Shield, Mail, ChevronDown, ChevronUp, Sparkles, Copy, CheckCircle } from "lucide-react";

export default function MembersPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
              return { uid, name: "Unknown User", email: "N/A" };
            })
          );
          setMembers(memberDocs);
        }
        setLoading(false);
      }
    });
    return () => unsub();
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-red-950/50 border border-red-500/20 rounded-2xl p-6 max-w-md backdrop-blur-xl">
          <p className="text-red-400">Group not found.</p>
        </div>
      </div>
    );
  }

  const isAdmin = group.admins?.includes(currentUser?.uid);

  const handleInvite = async () => {
    const link = `${window.location.origin}/groups/join?groupId=${groupId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMemberDetails = (uid: string) => {
    setExpandedMember(expandedMember === uid ? null : uid);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-xl shadow-yellow-500/30">
                  <Users className="w-7 h-7 text-amber-950" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text">
                  Group Members
                </h1>
                <p className="text-amber-300/70 text-sm mt-1">{members.length} members in this group</p>
              </div>
            </div>

            <button
              onClick={handleInvite}
              className="group relative px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl font-semibold text-amber-950 hover:from-yellow-300 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 flex items-center gap-2 justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Link Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Invite Members</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300/70 text-sm font-medium">Group Information</p>
                <p className="text-yellow-300 text-lg font-semibold mt-1">{group.name}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{members.length}</p>
                  <p className="text-amber-300/70 text-xs">Members</p>
                </div>
                <div className="w-px bg-yellow-500/20"></div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{group.admins?.length || 0}</p>
                  <p className="text-amber-300/70 text-xs">Admins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member, index) => {
            const isCreator = group.createdBy === member.uid;
            const isAdminMember = (group.admins || []).includes(member.uid);
            const isExpanded = expandedMember === member.uid;

            return (
              <div
                key={member.uid}
                className="bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl overflow-hidden hover:border-yellow-400/40 hover:bg-zinc-900/60 transition-all duration-300"
                style={{ 
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                }}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleMemberDetails(member.uid)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Profile Photo */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity"></div>
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.name}
                            className="relative w-14 h-14 rounded-full object-cover border-2 border-yellow-500/30 shadow-lg"
                          />
                        ) : (
                          <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-yellow-500/30 shadow-lg">
                            <span className="text-amber-950 font-bold text-lg">
                              {getInitials(member.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-yellow-300 truncate">
                            {member.name || "Unknown User"}
                          </h3>
                          {isCreator && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-lg text-xs font-semibold text-yellow-300">
                              <Crown className="w-3 h-3" />
                              Creator
                            </span>
                          )}
                          {isAdminMember && !isCreator && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-400/30 rounded-lg text-xs font-semibold text-amber-300">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-amber-300/70 text-sm mt-1">
                          {member.uid === currentUser?.uid ? "You" : "Member"}
                        </p>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-all">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-yellow-500/10">
                    <div className="bg-zinc-900/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg mt-0.5">
                          <Mail className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-amber-300/70 text-xs font-medium mb-1">Email Address</p>
                          <p className="text-yellow-300 text-sm break-all">
                            {member.email || "No email provided"}
                          </p>
                        </div>
                      </div>
                      
                      {member.uid === currentUser?.uid && (
                        <div className="pt-2 border-t border-yellow-500/10">
                          <p className="text-amber-300/70 text-xs italic">This is your account</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className="bg-zinc-900/30 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">No Members Yet</h3>
            <p className="text-amber-300/70 mb-6">Invite people to join this group!</p>
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