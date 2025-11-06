import React, { useContext, useMemo, useState } from 'react';
import { Plus, Globe2, Wifi, TrendingUp, Timer } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';
import StatCard from '../components/StatCard';
import WebsiteCard from '../components/WebsiteCard';
import AddWebsiteModal from '../components/AddWebsiteModal';

export default function DashboardPage() {
  const { websites, loading, error, createWebsite } = useContext(Connect_Context);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate stats from the live website data
  const calculatedStats = useMemo(() => {
    if (!websites || websites.length === 0) {
      return [
        { id: 'total', title: 'Total Websites', value: '0', icon: <Globe2 size={20} className="text-gray-400" /> },
        { id: 'online', title: 'Online', value: '0', icon: <Wifi size={20} className="text-gray-400" /> },
        { id: 'uptime', title: 'Average Uptime', value: 'N/A', icon: <TrendingUp size={20} className="text-gray-400" /> },
        { id: 'response', title: 'Avg Response Time', value: 'N/A', icon: <Timer size={20} className="text-gray-400" /> },
      ];
    }

    const online = (websites || [])
  .filter(w => w.name && w.url) // remove rows where name or url is null
  .filter(w => w.status && w.status.toLowerCase() === 'online')
  .length;


    const avgUptime = "100.00"; // Mocked uptime

    const sitesWithResponse = websites.filter(w => w.responseTimeMs !== null);
    const totalResponse = sitesWithResponse.reduce((acc, w) => acc + w.responseTimeMs, 0);
    const avgResponse = sitesWithResponse.length > 0 ? Math.round(totalResponse / sitesWithResponse.length) : 0;

    return [
      { id: 'total', title: 'Total Websites', value: websites.length, icon: <Globe2 size={20} className="text-gray-400" /> },
      { id: 'online', title: 'Online', value: online, icon: <Wifi size={20} className="text-gray-400" /> },
      { id: 'uptime', title: 'Average Uptime', value: `${avgUptime}%`, icon: <TrendingUp size={20} className="text-gray-400" /> },
      { id: 'response', title: 'Avg Response Time', value: `${avgResponse}ms`, icon: <Timer size={20} className="text-gray-400" /> },
    ];
  }, [websites]);

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mt-4 md:mt-0"
        >
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {calculatedStats.map((stat) => (
          <StatCard
            key={stat.id} // Use unique id instead of title
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

        {/* Handle Loading, Error, and Empty States */}
        {loading && <p className="text-gray-400">Loading websites...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {!loading && !error && websites.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-gray-900 rounded-lg border border-gray-800">
            <p>No websites are being monitored yet.</p>
            <p>Click "Add Website" to get started.</p>
          </div>
        )}

        {/* Websites Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {websites.map((website, index) => (
            <WebsiteCard
              key={website.id || index} // Fallback to index if id is missing
              website={website}
            />
          ))}
        </div>
      </div>

      {/* Add Website Modal */}
      <AddWebsiteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createWebsite}
      />
    </>
  );
}
