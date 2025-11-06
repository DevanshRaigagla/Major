import React from 'react';
import { Plus, Search } from 'lucide-react';
import { websitesData } from '../data/mockData';
import WebsiteCard from '../components/WebsiteCard';

export default function WebsitesPage() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">All Websites</h1>
          <p className="text-gray-400 mt-1">
            Manage and monitor all your websites
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mt-4 md:mt-0">
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search websites..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Websites Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {websitesData.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>
    </>
  );
}