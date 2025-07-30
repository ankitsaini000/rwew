import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "../components/ClientProviders";
import { Toaster } from 'react-hot-toast';
import AIChat from '@/components/ai/AIChat';
import BottomBar from '../components/ui/BottomBar';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ClientProviders>
          {children}
          <BottomBar />
          <Toaster />
          <AIChat />
        </ClientProviders>
      </body>
    </html>
  );
}
