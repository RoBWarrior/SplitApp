"use client";
import dynamic from "next/dynamic";

// ✅ Lazy load Navbar client-side only
const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

export default function ClientNavbarWrapper() {
  return <Navbar />;
}
