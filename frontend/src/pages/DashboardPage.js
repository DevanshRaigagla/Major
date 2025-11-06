import React from 'react';
import { Plus } from 'lucide-react';
import { statsData, websitesData } from '../data/mockData';
import StatCard from '../components/StatCard';
import WebsiteCard from '../components/WebsiteCard';

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor your websites in real-time
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mt-4 md:mt-0">
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Monitored Websites Section */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Monitored Websites
        </h2>
        {/* Websites Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {websitesData.map((website) => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      </div>
    </>
  );
}