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
            ? "bg-zinc-950/5 backdrop-blur-xl shadow-lg shadow-orange-500/5 border-b border-zinc-800/50"
            : "bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/30"
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
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text">
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
                        ? "text-orange-400"
                        : "text-zinc-400 hover:text-orange-400"
                    }`}
                  >
                    {/* Hover Background */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-orange-500/10 border border-orange-500/20"
                          : "bg-transparent group-hover:bg-zinc-800/50 border border-transparent group-hover:border-zinc-700/50"
                      }`}
                    ></div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
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
              className="md:hidden relative p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/50 transition-all duration-300"
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
          <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50">
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
                        ? "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                        : "text-zinc-400 hover:text-orange-400 hover:bg-zinc-800/50 border border-transparent"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-orange-500/20"
                          : "bg-zinc-800/50 group-hover:bg-orange-500/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{link.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-orange-500"></div>
                    )}
                  </Link>
                );
              })}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-500/20 transition-all duration-300 mt-4"
                >
                  <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-red-950/50 transition-all">
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