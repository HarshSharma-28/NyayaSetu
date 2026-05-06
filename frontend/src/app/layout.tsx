import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaSetu | Judicial Compliance Platform",
  description: "Transforming court orders into verified actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#06111f] font-sans">{children}</body>
    </html>
  );
}
