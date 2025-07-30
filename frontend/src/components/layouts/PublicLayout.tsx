import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { FaSearch, FaUser } from 'react-icons/fa';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  title = 'Creator Marketplace'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Find and hire top creative talent" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  CreatorMarket
                </Link>
                <nav className="hidden md:ml-10 md:flex md:space-x-8">
                  <Link href="/explore" className="text-gray-700 hover:text-indigo-600 font-medium">
                    Explore
                  </Link>
                  <Link href="/categories" className="text-gray-700 hover:text-indigo-600 font-medium">
                    Categories
                  </Link>
                  <Link href="/about" className="text-gray-700 hover:text-indigo-600 font-medium">
                    About
                  </Link>
                </nav>
              </div>
              
              {/* Search and User */}
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch size={16} color="#9ca3af" />
                  </div>
                  <input 
                    type="text" 
                    className="py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Search creators"
                  />
                </div>
                <div className="flex">
                  <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <span className="mr-2"><FaUser size={14} /></span> Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </>
  );
};

export default PublicLayout; 