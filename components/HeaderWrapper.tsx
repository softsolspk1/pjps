"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  
  // Hide site header for Admin Panel routes
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/reviewer");
  
  if (isAdminPage) return null;
  
  return <Header />;
}
