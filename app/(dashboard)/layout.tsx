"use client";

import NavBar from "@/app/components/ui/navBar";
import { requireAuth } from "@/lib/firebase/requireAuth"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { user, loading } = requireAuth();

  if(loading) return <div></div>

  return (
    <div className="flex flex-row min-h-screen w-full">
      <div className="basis-[10%] shrink-0 h-screen self-start sticky top-0 z-30 flex justify-center">
        <NavBar />
      </div>
      <main className="basis-[90%] grow min-h-screen min-w-0 flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}