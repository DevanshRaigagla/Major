import React, { useState, useContext } from 'react';
import { Bell, Mail, Smartphone, SlidersHorizontal } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';
import ToggleSwitch from '../components/ToggleSwitch';

// Note: Your backend supports notification settings, but your
// Api.js doesn't have functions for it yet.
// This is a static page for now, as in your file.
// You can uncomment the context logic once you add
// `fetchSettings` and `updateSettings` to your Api.js.

export default function SettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  // const { notificationSettings, upsertNotificationSettings, loading } = useContext(Connect_Context);
  // const [email, setEmail] = useState('');

  // useEffect(() => {
  //   if (notificationSettings) {
  //     setEmail(notificationSettings.email || '');
  //     setEmailEnabled(notificationSettings.notifyOn === 'both' || notificationSettings.notifyOn === 'email');
  //     setSmsEnabled(notificationSettings.notifyOn === 'both' || notificationSettings.notifyOn === 'sms');
  //   }
  // }, [notificationSettings]);

  // const handleSave = () => {
  //   let notifyOn = 'never';
  //   if (emailEnabled && smsEnabled) notifyOn = 'both';
  //   else if (emailEnabled) notifyOn = 'email';
  //   else if (smsEnabled) notifyOn = 'sms';
    
  //   upsertNotificationSettings({ 
  //     websiteId: "your_website_id_here", // This needs to be dynamic
  //     email, 
  //     smsNumber: null, // Add SMS number field
  //     notifyOn 
  //   });
  // };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Configure notification preferences and account settings
        </p>
      </div>

      {/* Settings Sections */}
      <div className="max-w-3xl space-y-8">
        
        {/* Notification Preferences */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Bell size={22} />
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose how you want to be notified about website incidents.
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Email Notifications */}
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

            {/* Email Address Input */}
            {emailEnabled && (
              <div className="pl-9">
                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  defaultValue="your@email.com"
                  // value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}
            
            <hr className="border-gray-800" />

            {/* SMS Notifications */}
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
            <p className="text-sm text-gray-400 mt-1">
              Check the status of notification services
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-white">Email Service</h3>
                <p className="text-sm text-gray-400">SMTP Configuration</p>
              </div>
              <span className="text-sm text-gray-500">
                Not Configured
              </span>
            </div>
          </div>
        </section>
        
        {/* <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Save Settings
          </button>
        </div> */}

      </div>
    </>
  );
}