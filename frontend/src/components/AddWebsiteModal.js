import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

export default function AddWebsiteModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !url.startsWith('http')) {
      alert("Please enter a valid name and a full URL (e.g., https://google.com)");
      return;
    }
    // Pass name and url to the create function from context
    onCreate({ name, url }); 
    setName('');
    setUrl('');
    onClose();
  };

  return (
    // This is the modal container
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      
      {/* This is the modal content */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg w-full max-w-md">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Add a New Website</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <XCircle size={22} />
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Website Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Blog"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">URL</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Add Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}