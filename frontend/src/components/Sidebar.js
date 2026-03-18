import React, { useContext, useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Globe,
  AlertTriangle,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogout(false);
    navigate('/login');
  };

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
          <div className="relative" ref={popupRef}>
            {/* Logout Popup — appears above the profile row */}
            {showLogout && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}

            {/* Profile Row */}
            <div
              onClick={() => setShowLogout(prev => !prev)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.user_email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {user?.user_email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">
                    {user?.user_email || ''}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform duration-200 ${showLogout ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}


function SidebarItem({ label, icon, path, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      
      className={({ isActive }) => `
        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
        font-medium text-sm transition-all duration-200
        ${
          isActive
            ? 'bg-gray-800 text-white' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white' 
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}