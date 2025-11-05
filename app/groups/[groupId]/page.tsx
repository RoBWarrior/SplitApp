"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { calculateBalances, simplifyTransactions } from "@/lib/balance";
import { 
  Users, 
  Plus, 
  Edit3, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Eye
} from "lucide-react";

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<
    { from: string; to: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else router.push("/login");
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) return;
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

        const expSnap = await getDocs(collection(db, `groups/${groupId}/expenses`));
        const expensesData = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setExpenses(expensesData);

        const calculated = calculateBalances(expensesData);
        setBalances(calculated);

        const txns = simplifyTransactions(calculated);
        setTransactions(txns);
      }

      setLoading(false);
    };

    fetchGroupData();
  }, [groupId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <Wallet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-orange-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 flex items-center justify-center p-6">
        <div className="bg-red-950/50 border border-red-500/20 rounded-2xl p-6 max-w-md backdrop-blur-xl">
          <p className="text-red-400">Group not found.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const isAdmin = group.admins?.includes(currentUser.uid);

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, {
      members: arrayRemove(currentUser.uid),
      admins: arrayRemove(currentUser.uid),
    });
    alert("You left the group.");
    router.push("/dashboard");
  };

  const changeGroupName = async () => {
    if (group.adminOnlyNameChange && !isAdmin)
      return alert("Only admins can change group name.");
    const newName = prompt("Enter new group name:", group.name);
    if (!newName || newName === group.name) return;
    const groupRef = doc(db, "groups", group.id);
    await updateDoc(groupRef, { name: newName });
    setGroup({ ...group, name: newName });
  };

  const myBalance = balances[currentUser.uid] || 0;

  const owedList = transactions
    .filter((t) => t.from === currentUser.uid)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const getsList = transactions
    .filter((t) => t.to === currentUser.uid)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-orange-950/20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text">
                  {group.name}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">{members.length} members</p>
              </div>
            </div>

            {/* Action Buttons - Mobile Responsive */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={changeGroupName}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 text-zinc-300 rounded-xl hover:border-orange-500/50 hover:text-orange-400 transition-all text-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Rename</span>
              </button>
              
              <button
                onClick={() => router.push(`/groups/${groupId}/members`)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 text-zinc-300 rounded-xl hover:border-orange-500/50 hover:text-orange-400 transition-all text-sm"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Members</span>
              </button>

              <button
                onClick={() => router.push(`/groups/${groupId}/add-expense`)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>

              <button
                onClick={handleLeaveGroup}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 text-red-400 rounded-xl hover:border-red-500/50 hover:bg-red-950/30 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Balance Card */}
          <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 lg:p-8 hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Wallet className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-100">Your Balance</h2>
            </div>

            {/* Balance Display */}
            <div className="mb-8">
              {myBalance > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">You will receive</p>
                    <p className="text-4xl font-bold text-green-400">
                      ₹{myBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              {myBalance < 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 rounded-xl">
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">You owe</p>
                    <p className="text-4xl font-bold text-red-400">
                      ₹{Math.abs(myBalance).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              {myBalance === 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Status</p>
                    <p className="text-3xl font-bold text-green-400">All Settled!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* You Owe */}
              {owedList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-zinc-300">You Owe</h3>
                  </div>
                  <div className="space-y-2">
                    {owedList.map((t, i) => {
                      const person = members.find((m) => m.uid === t.to)?.name || t.to;
                      return (
                        <div
                          key={i}
                          className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 flex items-center justify-between"
                        >
                          <span className="text-zinc-300 text-sm">{person}</span>
                          <span className="text-red-400 font-semibold">
                            ₹{t.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Owes You */}
              {getsList.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-zinc-300">Owes You</h3>
                  </div>
                  <div className="space-y-2">
                    {getsList.map((t, i) => {
                      const person = members.find((m) => m.uid === t.from)?.name || t.from;
                      return (
                        <div
                          key={i}
                          className="bg-green-950/20 border border-green-500/20 rounded-xl p-3 flex items-center justify-between"
                        >
                          <span className="text-zinc-300 text-sm">{person}</span>
                          <span className="text-green-400 font-semibold">
                            ₹{t.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <button
              onClick={() => router.push(`/groups/${groupId}/details`)}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 text-orange-400 rounded-xl hover:bg-zinc-800 hover:border-orange-500/50 transition-all"
            >
              <Eye className="w-5 h-5" />
              View Full Details
            </button>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Total Expenses</span>
                <Receipt className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-400">{expenses.length}</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Members</span>
                <Users className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-400">{members.length}</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Total Amount</span>
                <Wallet className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-400">
                ₹{expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Receipt className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Recent Expenses</h2>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-10 h-10 text-orange-400" />
              </div>
              <p className="text-zinc-400 mb-4">No expenses yet</p>
              <button
                onClick={() => router.push(`/groups/${groupId}/add-expense`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-5 h-5" />
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((exp, index) => (
                <div
                  key={exp.id}
                  className="group bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-4 hover:bg-zinc-800/50 hover:border-orange-500/30 transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-100 text-lg mb-1 truncate">
                        {exp.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                        <span>Paid by <span className="text-orange-400 font-medium">{exp.paidByName}</span></span>
                        <span className="text-zinc-600">•</span>
                        <span>{exp.splitBetween?.length || 1} people</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-orange-400">
                        ₹{exp.amount ? Number(exp.amount).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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