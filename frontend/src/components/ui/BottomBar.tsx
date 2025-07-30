'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Home, Gift, MessageSquare, User, Users, Search, Bell } from 'lucide-react';

const creatorMenu = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Available', href: '/available-promotions', icon: Gift },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Creator Dashboard', href: '/creator-dashboard', icon: User, center: true },
];

const brandMenu = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Find', href: '/find-creators', icon: Search },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Brand Dashboard', href: '/brand-dashboard', icon: Users, center: true },
];

const BottomBar = () => {
  const { user } = useAuth();
  const role = user?.role === 'creator' ? 'creator' : 'brand';
  const menu = role === 'creator' ? creatorMenu : brandMenu;
  const pathname = usePathname();
  const isChatOrMessages = pathname?.startsWith('/messages') || pathname?.startsWith('/chat');
  if (isChatOrMessages) return null;

  // Find center item
  const centerIdx = menu.findIndex((item) => item.center);
  const sideItems = menu.filter((item) => !item.center);
  const centerItem = menu[centerIdx];

  // Split side items for left/right
  const leftItems = sideItems.slice(0, 2);
  const rightItems = sideItems.slice(2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center md:hidden pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md mx-auto mb-2 px-1"> {/* reduced mb and px */}
        <div className="relative flex items-end justify-between bg-white rounded-2xl shadow-md px-2 py-1 min-h-[44px] border border-gray-100"> {/* reduced px, py, min-h */}
          {/* Left icons */}
          <div className="flex flex-1 justify-evenly">
            {leftItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex flex-col items-center">
                  <Icon className={`w-4 h-4 mb-0.5 transition-colors ${isActive ? 'text-[#6C47FF]' : 'text-gray-400'}`} /> {/* w-4 h-4 smaller */}
                  <span className={`text-[10px] ${isActive ? 'text-[#6C47FF]' : 'text-gray-400'}`}>{item.label}</span> {/* text-[10px] smaller */}
                </Link>
              );
            })}
          </div>

          {/* Center floating icon with notch */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10 flex flex-col items-center"> {/* -top-5 instead of -top-6 */}
            <Link href={centerItem.href} className="flex flex-col items-center">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6C47FF] shadow-lg ring-2 ring-white border border-gray-200"> {/* w-10 h-10 smaller */}
                <centerItem.icon className="w-5 h-5 text-white" /> {/* w-5 h-5 smaller */}
              </span>
            </Link>
          </div>

          {/* Right icons */}
          <div className="flex flex-1 justify-evenly">
            {rightItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="flex flex-col items-center">
                  <Icon className={`w-4 h-4 mb-0.5 transition-colors ${isActive ? 'text-[#6C47FF]' : 'text-gray-400'}`} />
                  <span className={`text-[10px] ${isActive ? 'text-[#6C47FF]' : 'text-gray-400'}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomBar; 