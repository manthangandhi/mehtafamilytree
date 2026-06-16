import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mehta Kutumb",
  description: "Our family legacy across generations and borders. A secure digital archive for the Mehta family.",
  icons: {
    icon: [
      { url: "/images/mehta-kutumb-icon.jpg", sizes: "any" },
    ],
    apple: "/images/mehta-kutumb-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppHeader />
        <div className="flex-1 pt-24 pb-12 bg-background">{children}</div>
        <Footer />
        <CookieBanner />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
