"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged, signOut, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, LogOut, Shield, Camera, Edit3, Key, Settings, Sparkles, Save, X, Check } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setNewName(currentUser.displayName || "");
        setNewEmail(currentUser.email || "");
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingPhoto(true);
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(user, { photoURL });
      
      // Update user state
      setUser({ ...user, photoURL });
      showSaveMessage("Profile photo updated!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      showSaveMessage("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    
    try {
      await updateProfile(user, { displayName: newName });
      setUser({ ...user, displayName: newName });
      setIsEditingName(false);
      showSaveMessage("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name:", error);
      showSaveMessage("Failed to update name");
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !newEmail.trim()) return;
    
    try {
      await updateEmail(user, newEmail);
      setUser({ ...user, email: newEmail });
      setIsEditingEmail(false);
      showSaveMessage("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      showSaveMessage("Failed to update email. You may need to re-login.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !newPassword.trim() || newPassword.length < 6) {
      showSaveMessage("Password must be at least 6 characters");
      return;
    }
    
    try {
      await updatePassword(user, newPassword);
      setIsEditingPassword(false);
      setNewPassword("");
      showSaveMessage("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      showSaveMessage("Failed to update password. You may need to re-login.");
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Save Message */}
        {saveMessage && (
          <div className="fixed top-4 right-4 bg-zinc-900/90 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-6 py-3 shadow-lg shadow-yellow-500/20 flex items-center gap-3 z-50 animate-slideIn">
            <Check className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">{saveMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-60"></div>
              <div className="relative p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-xl shadow-yellow-500/30">
                <User className="w-7 h-7 text-amber-950" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text">
                My Profile
              </h1>
              <p className="text-amber-300/70 text-sm mt-1">Manage your account settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-lg shadow-yellow-500/30"
                : "bg-zinc-900/50 border border-yellow-500/20 text-amber-300 hover:border-yellow-400/40"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 shadow-lg shadow-yellow-500/30"
                : "bg-zinc-900/50 border border-yellow-500/20 text-amber-300 hover:border-yellow-400/40"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-3xl overflow-hidden">
              {/* Header Gradient */}
              <div className="h-32 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -bottom-16 left-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="relative w-32 h-32 rounded-full border-4 border-zinc-900 shadow-xl object-cover transform transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative w-32 h-32 rounded-full border-4 border-zinc-900 shadow-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                        <span className="text-amber-950 font-bold text-4xl">
                          {getInitials(user?.displayName || "User")}
                        </span>
                      </div>
                    )}
                    {/* Upload Photo Button */}
                    <label className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-zinc-900">
                      <Camera className="w-4 h-4 text-amber-950" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-20 pb-8 px-8">
                {/* Name Section */}
                <div className="mb-6">
                  {isEditingName ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-zinc-900/50 border border-yellow-500/30 rounded-xl px-4 py-2 text-yellow-300 focus:outline-none focus:border-yellow-400/50"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleUpdateName}
                        className="p-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg hover:scale-105 transition-transform"
                      >
                        <Check className="w-5 h-5 text-amber-950" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(user?.displayName || "");
                        }}
                        className="p-2 bg-zinc-900/50 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-colors"
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-yellow-300">
                        {user?.displayName || "User"}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:border-yellow-400/40 transition-colors"
                      >
                        <Edit3 className="w-5 h-5 text-yellow-400" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-amber-300/70 mb-8">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User ID Card */}
                  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-400/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                        <Shield className="w-5 h-5 text-amber-950" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-300/70 font-medium uppercase tracking-wide">User ID</p>
                        <p className="text-sm font-mono text-yellow-300 truncate">{user?.uid}</p>
                      </div>
                    </div>
                  </div>

                  {/* Member Since Card */}
                  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-yellow-500/20 hover:border-yellow-400/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg">
                        <Calendar className="w-5 h-5 text-amber-950" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-amber-300/70 font-medium uppercase tracking-wide">Member Since</p>
                        <p className="text-sm text-yellow-300">
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
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-1">Account Status</h3>
                  <p className="text-sm text-amber-300/70">
                    Your account is active and verified. You have full access to all features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Email Settings */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-yellow-300">Email Address</h3>
              </div>
              
              {isEditingEmail ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-300 focus:outline-none focus:border-yellow-400/50"
                    placeholder="Enter new email"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateEmail}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 rounded-xl font-semibold hover:from-yellow-300 hover:to-amber-400 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setNewEmail(user?.email || "");
                      }}
                      className="px-4 py-3 bg-zinc-900/50 border border-red-500/30 text-red-400 rounded-xl hover:border-red-500/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-amber-300/70">{user?.email}</p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg hover:border-yellow-400/40 transition-colors text-sm font-medium"
                  >
                    Change Email
                  </button>
                </div>
              )}
            </div>

            {/* Password Settings */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Key className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-yellow-300">Password</h3>
              </div>
              
              {isEditingPassword ? (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-300 focus:outline-none focus:border-yellow-400/50"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdatePassword}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 rounded-xl font-semibold hover:from-yellow-300 hover:to-amber-400 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setNewPassword("");
                      }}
                      className="px-4 py-3 bg-zinc-900/50 border border-red-500/30 text-red-400 rounded-xl hover:border-red-500/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-amber-300/70">••••••••</p>
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg hover:border-yellow-400/40 transition-colors text-sm font-medium"
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-amber-300/70 text-sm mb-4">
                Sign out from your account. You'll need to sign in again to access your data.
              </p>
              <button
                onClick={handleLogout}
                className="w-full group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}