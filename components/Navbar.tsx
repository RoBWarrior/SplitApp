"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X, Wallet, Users, User, LogOut, Home } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-teal-500/5 border-b border-teal-500/20"
            : "bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text">
                  SplitWise
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "text-teal-400"
                        : "text-slate-300 hover:text-teal-400"
                    }`}
                  >
                    {/* Hover Background */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-teal-500/10 border border-teal-500/30"
                          : "bg-transparent group-hover:bg-slate-800/50 border border-transparent group-hover:border-slate-600/50"
                      }`}
                    ></div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                    )}

                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 font-medium">{link.name}</span>
                  </Link>
                );
              })}

              {user && (
                <button
                  onClick={handleLogout}
                  className="group relative flex items-center gap-2 ml-4 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-red-950/30 border border-transparent group-hover:border-red-500/20 rounded-xl transition-all duration-300"></div>
                  <LogOut className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 font-medium">Logout</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative p-2 rounded-xl text-slate-300 hover:text-teal-400 hover:bg-slate-800/50 transition-all duration-300"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown with Animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-slate-800/95 backdrop-blur-xl border-t border-teal-500/20">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-teal-500/10 border border-teal-500/30 text-teal-400"
                        : "text-slate-300 hover:text-teal-400 hover:bg-slate-700/50 border border-transparent"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-teal-500/20"
                          : "bg-slate-700/50 group-hover:bg-teal-500/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{link.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-teal-400"></div>
                    )}
                  </Link>
                );
              })}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all duration-300 mt-4"
                >
                  <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-red-950/50 transition-all">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 sm:h-20"></div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}