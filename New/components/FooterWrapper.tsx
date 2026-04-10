"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide site footer for Admin/Reviewer routes to prevent cluttering institutional dashboards
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/reviewer");
  
  if (isAdminPage) return null;
  
  return <Footer />;
}
