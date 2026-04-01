import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

export const metadata: Metadata = {
  title: "VDING - Would You In",
  description:
    "Create your own app from just an idea. VDing turns your concept into a real service with AI-powered UI generation.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ colorScheme: "light only" }}>
      <head>
        <meta name="color-scheme" content="light only" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem("darkMode");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const shouldBeDark = saved ? saved === "true" : prefersDark;
                  if (shouldBeDark) {
                    document.documentElement.classList.add("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
