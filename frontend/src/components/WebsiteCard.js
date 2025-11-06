import React from 'react';
import { Globe, MoreVertical } from 'lucide-react';

/**
 * A card for a single monitored website.
 */
export default function WebsiteCard({ website }) {
  const isOnline = website.status === 'Online';
  const isWarning = website.status === 'Warning';

  // Determine status color
  const statusColor = isOnline
    ? 'text-green-500'
    : isWarning
    ? 'text-yellow-500'
    : 'text-red-500';
  
  const statusBgColor = isOnline
    ? 'bg-green-500'
    : isWarning
    ? 'bg-yellow-500'
    : 'bg-red-500';

  // Determine uptime color
  const uptime = parseFloat(website.uptime);
  const uptimeColor = uptime > 95 ? 'text-green-500' : uptime > 80 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 divide-y divide-gray-800">
      {/* Card Header */}
      <div className="p-5 flex justify-between items-start">
        <div className="flex gap-4">
          <div className="bg-gray-800 h-12 w-12 rounded-lg flex items-center justify-center">
            <Globe size={24} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{website.name}</h3>
            <p className="text-sm text-gray-400 truncate max-w-[200px] sm:max-w-xs">
              {website.url}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{website.responseTime}</span>
          <button className="text-gray-500 hover:text-white">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Card Body (Stats) */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusBgColor}`}></span>
            <span className={`text-sm font-medium ${statusColor}`}>
              {website.status}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Uptime</p>
          <p className={`text-sm font-medium ${uptimeColor}`}>{website.uptime}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">Last Checked</p>
          <p className="text-sm font-medium text-gray-400">
            {website.lastChecked}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4">
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200">
          View Details
        </button>
      </div>
    </div>
  );
}