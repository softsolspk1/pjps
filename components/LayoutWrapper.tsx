'use client';

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSpecialRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/reviewer');

  return (
    <>
      <Header />
      <main className={!isSpecialRoute ? "pt-[120px]" : ""}>
        {children}
      </main>
      <Footer />
    </>
  );
}
