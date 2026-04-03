"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import PageTransition from "@/components/layout/PageTransition";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ✅ UPDATED NAVIGATION
  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Interview", href: "/interview" },
    { name: "Resume Analyzer", href: "/resume" },
    { name: "Profile", href: "/profile" }, // ← ADDED
    { name: "Resume Builder", href: "/resume-builder" },

  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar />

      <div className="flex h-[calc(100vh-80px)]">

        {/* SIDEBAR */}
        <aside
          className="
          w-64
          h-full
          bg-black/60
          backdrop-blur-xl
          border-r
          border-white/10
          p-6
          flex
          flex-col
          justify-between
          "
        >

          <div>

            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-6">
              Navigation
            </h2>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      block
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      font-medium
                      transition
                      ${
                        isActive
                          ? "bg-white/10 text-white border border-white/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
            px-4
            py-2
            rounded-lg
            text-sm
            font-medium
            bg-red-500/10
            border
            border-red-400/30
            text-red-300
            hover:bg-red-500/20
            transition
            "
          >
            Logout
          </button>

        </aside>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </div>

      </div>
    </>
  );
}