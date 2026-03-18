import React, { useContext, useState } from 'react';
import { Plus } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';
import StatCard from '../components/StatCard';
import WebsiteCard from '../components/WebsiteCard';
import AddWebsiteModal from '../components/AddWebsiteModal';

export default function DashboardPage() {
  const { websites, createWebsite } = useContext(Connect_Context);
  const [openModal, setOpenModal] = useState(false);

  const totalWebsites = websites.length;
  const onlineWebsites = websites.filter(w => w.status === 'online').length;

  const statsData = [
    { title: "Total Websites", value: totalWebsites },
    { title: "Online", value: onlineWebsites },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor your websites in real-time</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 h-10"
        >
          <Plus size={16} />
          Add Website
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {statsData.map(stat => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>

      {/* Websites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {websites.map(site => (
          <WebsiteCard key={site.id} website={site} />
        ))}
      </div>

      {/* Modal */}
      <AddWebsiteModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={createWebsite}
      />
    </>
  );
}
