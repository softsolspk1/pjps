"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import HeaderWrapper from "./HeaderWrapper";
import FooterWrapper from "./FooterWrapper";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname) {
      fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname })
      }).catch(err => console.error("Tracking error:", err));
    }
  }, [pathname]);

  // Identify administrative pathways
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/reviewer");
  
  return (
    <div className="flex-1 flex flex-col">
      <HeaderWrapper />
      <main className={!isAdminPage ? "public-content-buffer" : "flex-1 flex flex-col"}>
        {children}
      </main>
      <FooterWrapper />
    </div>
  );
}
