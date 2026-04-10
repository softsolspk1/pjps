import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

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
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </Providers>
      </body>
    </html>
  );
}
