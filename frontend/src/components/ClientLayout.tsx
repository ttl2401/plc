// components/ClientLayout.tsx
"use client";
import { usePathname } from "next/navigation";
import DashboardLayoutWithProvider from "@/components/layout/DashboardLayout";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideMenuRoutes = ["/auth/login", "/auth/register", "/extend/electric-current", "/extend/card-scanner"];
  const hideMenu = hideMenuRoutes.includes(pathname);

  if (hideMenu) return <>{children}</>;
  return <DashboardLayoutWithProvider>{children}</DashboardLayoutWithProvider>;
}
