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
      <body>
        <Providers>
          <HeaderWrapper />
          <main>{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
