import type { Metadata } from "next";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper";
import FooterWrapper from "@/components/FooterWrapper";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Pakistan Journal of Pharmaceutical Sciences (PJPS)",
  description: "A leading global forum for pharmaceutical and biomedical research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-white min-h-screen flex flex-col">
        <Providers>
          <HeaderWrapper />
          {/* Main content wrapper to handle global padding if needed, although HeaderWrapper handles visibility */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
