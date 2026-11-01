import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import ATLYXPageLoader from "@/components/ui/ATLYXPageLoader";
import AmbientShutterBackground from "@/components/ui/AmbientShutterBackground";

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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "ATLYX Learning Management System",
  description: "Master in-demand skills with expert-led courses in Web Development, UI/UX Design, Data Science, and more.",
  url: "https://lms-portal-ruby.vercel.app",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AuthModal />
          <Suspense fallback={null}>
            <ATLYXPageLoader />
          </Suspense>
          <AmbientShutterBackground />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
