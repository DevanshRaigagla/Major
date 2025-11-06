import React, { useContext, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';
import WebsiteCard from '../components/WebsiteCard';
import AddWebsiteModal from '../components/AddWebsiteModal';

export default function WebsitesPage() {
  const { websites, loading, error, createWebsite } = useContext(Connect_Context);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  console.log("Websites data in WebsitesPage:", websites);

  // Filter websites based on search (handles empty array)
  const filteredWebsites = (websites || [])
  .filter(w => w.name && w.url) // remove entries with null/undefined name or url
  .filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.url.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 mt-4 md:mt-0"
        >
          <Plus size={18} />
          Add Website
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search websites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

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
        {filteredWebsites.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
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