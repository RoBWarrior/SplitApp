"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, LogOut, Shield } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Main Profile Card */}
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 overflow-hidden transform transition-all duration-500 hover:shadow-indigo-200/50 hover:scale-[1.02]">
          {/* Header Gradient */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={user?.photoURL || "/default-avatar.png"}
                  alt="Profile"
                  className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transform transition-transform group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-8 px-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {user?.displayName || "User"}
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              {/* User ID Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">User ID</p>
                    <p className="text-sm font-mono text-gray-800 truncate">{user?.uid}</p>
                  </div>
                </div>
              </div>

              {/* Account Created Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Member Since</p>
                    <p className="text-sm text-gray-800">
                      {new Date(user?.metadata.creationTime).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-8 w-full group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" />
                Sign Out
              </span>
            </button>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 backdrop-blur-xl bg-white/50 rounded-2xl p-6 border border-white/50 shadow-lg">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-indigo-500 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Account Status</h3>
              <p className="text-sm text-gray-600">
                Your account is active and verified. You have full access to all features.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}