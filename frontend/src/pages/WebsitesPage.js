import React, { useContext, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';
import WebsiteCard from '../components/WebsiteCard';
import AddWebsiteModal from '../components/AddWebsiteModal';

export default function WebsitesPage() {
  const { websites, createWebsite } = useContext(Connect_Context);
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">All Websites</h1>
          <p className="text-gray-400 mt-1">Manage all your websites</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 h-10"
        >
          <Plus size={16} />
          Add Website
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 pl-10 text-white"
          placeholder="Search..."
        />
        <Search size={18} className="absolute left-3 top-3 text-gray-500" />
      </div>

      {/* Cards */}
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
