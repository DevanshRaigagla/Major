import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Globe,
  AlertTriangle,
  Settings,
  ChevronDown,
} from 'lucide-react';

/**
 * Sidebar component.
 * We replace the <button> NavItems with <NavLink> from react-router-dom.
 * NavLink will automatically add an "active" class,
 * which we use to style the active link.
 */
export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Websites', icon: <Globe size={20} />, path: '/websites' },
    { name: 'Incidents', icon: <AlertTriangle size={20} />, path: '/incidents' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <nav
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-gray-900 shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-gray-800`}
      >
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-5 h-20 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Archangel</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase px-3 pt-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <SidebarItem
              key={item.name}
              label={item.name}
              icon={item.icon}
              path={item.path}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}
        </div>

        {/* Sidebar Footer (User Account) */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <img
                src="https://placehold.co/40x40/60a5fa/ffffff?text=U"
                alt="User avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-white">Username</p>
                <p className="text-xs text-gray-400">user@example.com</p>
              </div>
            </div>
            <ChevronDown size={18} className="text-gray-500" />
          </div>
        </div>
      </nav>
    </>
  );
}

/**
 * SidebarItem (sub-component)
 * Uses NavLink to handle active state.
 */
function SidebarItem({ label, icon, path, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      // This function-in-a-prop is how NavLink handles styling
      className={({ isActive }) => `
        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
        font-medium text-sm transition-all duration-200
        ${
          isActive
            ? 'bg-gray-800 text-white' // Active style
            : 'text-gray-400 hover:bg-gray-800 hover:text-white' // Inactive style
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}