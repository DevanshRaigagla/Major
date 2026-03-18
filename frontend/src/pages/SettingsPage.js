import React, { useState, useContext } from 'react';
import { Bell, Mail, Smartphone, SlidersHorizontal, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from '../components/ToggleSwitch';
import AuthContext from '../context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure notification preferences and account settings</p>
      </div>

      <div className="max-w-3xl space-y-8">

        {/* Account Info */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <User size={22} />
              Account
            </h2>
            <p className="text-sm text-gray-400 mt-1">Your account details</p>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Logged in as</h3>
              <p className="text-sm text-blue-400 mt-0.5">{user?.user_email || '—'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Bell size={22} />
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-400 mt-1">Choose how you want to be notified about website incidents.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <label htmlFor="emailEnabled" className="flex items-center gap-3 cursor-pointer">
                <Mail size={20} className="text-gray-400" />
                <div>
                  <h3 className="text-base font-medium text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-400">Receive alerts via email when websites go down</p>
                </div>
              </label>
              <ToggleSwitch id="emailEnabled" checked={emailEnabled} onChange={setEmailEnabled} />
            </div>
            {emailEnabled && (
              <div className="pl-9">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  id="emailAddress"
                  defaultValue={user?.user_email || ''}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}
            <hr className="border-gray-800" />
            <div className="flex items-center justify-between">
              <label htmlFor="smsEnabled" className="flex items-center gap-3 cursor-pointer">
                <Smartphone size={20} className="text-gray-400" />
                <div>
                  <h3 className="text-base font-medium text-white">SMS Notifications</h3>
                  <p className="text-sm text-gray-400">Get instant SMS alerts for critical incidents</p>
                </div>
              </label>
              <ToggleSwitch id="smsEnabled" checked={smsEnabled} onChange={setSmsEnabled} />
            </div>
          </div>
        </section>

        {/* Integration Status */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <SlidersHorizontal size={22} />
              Integration Status
            </h2>
            <p className="text-sm text-gray-400 mt-1">Check the status of notification services</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-white">Email Service</h3>
                <p className="text-sm text-gray-400">SMTP Configuration</p>
              </div>
              <span className="text-sm text-gray-500">Not Configured</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}