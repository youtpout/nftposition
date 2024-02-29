import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Search from "@/components/search";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Position Viewer",
  description: "View position info on multi chains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body className={inter.className}>
        <Search></Search>
        <div>
          {children}
        </div>
        </body>
    </html>
  );
}
