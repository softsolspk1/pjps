import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import LayoutWrapper from "@/components/LayoutWrapper";

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
      <body className="antialiased selection:bg-blue-100 selection:text-blue-900">
        <Providers>
           <LayoutWrapper>
             {children}
           </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
