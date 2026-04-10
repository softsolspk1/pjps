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

  // Identify dashboard and scholarly workflow pathways to suppress public navigation
  const isDashboardRoute = 
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/reviewer") || 
    pathname?.startsWith("/author") || 
    pathname?.startsWith("/submission") || 
    pathname?.startsWith("/tracking");
  
  return (
    <div className="flex-1 flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only skip-link">
        Skip to main content
      </a>
      {!isDashboardRoute && <HeaderWrapper />}
      <main id="main-content" className={!isDashboardRoute ? "public-content-buffer" : "flex-1 flex flex-col"} tabIndex={-1}>
        {children}
      </main>
      {!isDashboardRoute && <FooterWrapper />}
    </div>
  );
}
