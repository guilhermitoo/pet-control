// app/dashboard/layout.tsx
import { Navbar } from "@/components/Navbar";
import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}