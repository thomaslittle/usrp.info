import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { UserNav } from '@/components/user-nav';
import '@/lib/fetch-logger';

export const metadata: Metadata = {
  title: "PENTA UNTITLED PROJECT RP Resource Portal",
  description: "Comprehensive resource website for the PENTA UNTITLED PROJECT RP GTA5 roleplay server's EMS department with SOPs, protocols, and reference materials.",
  keywords: ["PENTA UNTITLED PROJECT RP", "EMS", "roleplay", "GTA5", "emergency medical services", "SOPs", "protocols"],
  authors: [{ name: "PENTA UNTITLED PROJECT RP Development Team" }],
  creator: "PENTA UNTITLED PROJECT RP",
  publisher: "PENTA UNTITLED PROJECT RP",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://usrp.info',
    siteName: 'PENTA UNTITLED PROJECT RP Resource Portal',
    title: 'PENTA UNTITLED PROJECT RP Resource Portal',
    description: 'Comprehensive resource website for the PENTA UNTITLED PROJECT RP GTA5 roleplay server\'s EMS department with SOPs, protocols, and reference materials.',
    images: [
      {
        url: '/images/wordmark.webp',
        width: 1200,
        height: 630,
        alt: 'PENTA UNTITLED PROJECT RP Resource Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PENTA UNTITLED PROJECT RP Resource Portal',
    description: 'Comprehensive resource website for the PENTA UNTITLED PROJECT RP GTA5 roleplay server\'s EMS department with SOPs, protocols, and reference materials.',
    images: ['/images/wordmark.webp'],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
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
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link href="https://fonts.cdnfonts.com/css/akrobat" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'PENTA UNTITLED PROJECT RP Resource Portal',
              description: 'Comprehensive resource website for the PENTA UNTITLED PROJECT RP GTA5 roleplay server\'s EMS department with SOPs, protocols, and reference materials.',
              url: 'https://usrp.info',
              publisher: {
                '@type': 'Organization',
                name: 'PENTA UNTITLED PROJECT RP',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://usrp.info/images/wordmark.webp',
                  width: 1200,
                  height: 630
                }
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://usrp.info/search?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
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
