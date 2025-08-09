'use client';

import { Header } from '@/components/layout/Header'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-120 h-120 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        {children}
      </div>
    </div>
  )
}