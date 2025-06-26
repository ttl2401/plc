// components/ClientLayout.tsx
"use client";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideMenuRoutes = ["/auth/login", "/auth/register"];
  const hideMenu = hideMenuRoutes.includes(pathname);

  if (hideMenu) return <>{children}</>;
  return <DashboardLayout>{children}</DashboardLayout>;
}
