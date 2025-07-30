"use client";

import Sidebar from '../components/Sidebar';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideSidebar = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/signup') {
      if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        window.location.href = '/login';
      }
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, sans-serif', background: '#f7f8fa', minHeight: '100vh', margin: 0 }}>
        <NotificationProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            {!hideSidebar && <Sidebar />}
            <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              {/* Notification Bell in top right */}
              {!hideSidebar && (
                <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 100 }}>
                  <NotificationDropdown />
                </div>
              )}
              {children}
            </main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}