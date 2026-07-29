import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import GalaxyBackground from "@/components/animations/GalaxyBackground";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATLYX – Premium Learning Management System",
  description:
    "Master in-demand skills with expert-led courses. ATLYX offers world-class training in Web Development, UI/UX Design, Data Science, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <GalaxyBackground />
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}


