import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { PanelLeft, ShieldCheck } from 'lucide-react';

/**
 * The Layout component provides the consistent structure
 * (Sidebar + Main Content) for all pages.
 * The <Outlet /> component from react-router-dom will render
 * the active page (e.g., DashboardPage, WebsitesPage).
 */
export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-200 font-sans">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile Header (shows toggle) */}
        <header className="p-4 md:hidden flex justify-between items-center bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
           <div className="flex items-center gap-2">
             <div className="bg-blue-600 p-2 rounded-lg">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Archangel</span>
           </div>
           <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            <PanelLeft size={24} />
          </button>
        </header>

        {/* This <Outlet> is the magic part. react-router-dom
          will render the correct page component here.
        */}
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}