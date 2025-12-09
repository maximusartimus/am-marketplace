import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "AM Marketplace - Armenia's Premier Online Marketplace",
  description: "Discover unique finds in Armenia. Shop from thousands of local sellers for electronics, fashion, vehicles, real estate, and more. Buy and sell with confidence.",
  keywords: "Armenia marketplace, buy sell Armenia, Yerevan marketplace, Armenian online shopping, list.am alternative",
  openGraph: {
    title: "AM Marketplace - Armenia's Premier Online Marketplace",
    description: "Discover unique finds in Armenia. Shop from thousands of local sellers.",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
