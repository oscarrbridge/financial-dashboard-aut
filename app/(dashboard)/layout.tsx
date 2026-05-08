import NavBar from "@/app/components/ui/navBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row min-h-screen w-full">
      <div className="basis-[10%] shrink-0 h-screen flex justify-center">
        <NavBar />
      </div>
      <main className="basis-[90%] grow min-h-screen min-w-0 flex justify-center items-center">
        {children}
      </main>
    </div>
  );
}