import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* "Skip to content" link for Accessibility (Prompt 8) */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[9999] bg-primary text-primary-foreground p-4">
        Skip to content
      </a>

      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main 
          id="main-content"
          className={`
            flex-1 transition-all duration-200 ease-in-out
            flex justify-center items-start pb-20 md:pb-0
            ${sidebarOpen ? 'md:ml-[80px] lg:ml-[260px]' : 'ml-0'}
          `}
        >
          <div className="w-full max-w-[1440px] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
