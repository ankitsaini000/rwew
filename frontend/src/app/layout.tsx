import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";
import { Toaster } from 'react-hot-toast';
import AIChat from '@/components/ai/AIChat';
import BottomBar from '../components/ui/BottomBar';
import OfflineOverlay from '../components/OfflineOverlay';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Influencer Marketplace",
  description: "Connect with influencers and grow your brand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`antialiased font-sans`}>
        <ClientProviders>
          {children}
          <OfflineOverlay />
          <BottomBar />
          <Toaster />
          <AIChat />
        </ClientProviders>
      </body>
    </html>
  );
}
