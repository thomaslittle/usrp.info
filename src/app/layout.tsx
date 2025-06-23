import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { UserNav } from '@/components/user-nav';

export const metadata: Metadata = {
  title: "Unscripted Resource Portal",
  description: "Comprehensive resource website for the Unscripted GTA5 roleplay server's EMS department",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.cdnfonts.com/css/akrobat" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-900 text-white min-h-screen">
        <Providers>
          <UserNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
