import React, { useState, useContext } from 'react';
import Connect_Context from "../context/ConnectContext";
import { Globe, MoreVertical } from 'lucide-react';

export default function WebsiteCard({ website }) {
  const { deleteWebsite } = useContext(Connect_Context);
  const [open, setOpen] = useState(false);

  // ------------------------
  // Relative time formatter
  // ------------------------
  const formatDate = (dateString) => {
  if (!dateString) return "—";

  const parsed = new Date(dateString);

  // Force correct timestamp difference
  const diffMs = Date.now() - parsed.getTime();

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

  // ------------------------
  // Safe data normalization
  // ------------------------
  const name = (website.name || "Unnamed Site").replace(/\d+\s?ms/gi, "").trim();
  const url = website.url || "";

  const statusRaw = (website.status || "").toLowerCase();
  const status =
    statusRaw === "up" || statusRaw === "online" ? "Online" :
    statusRaw === "warning" ? "Warning" :
    "Down";

  const responseTimeRaw = website.response_time || website.responseTime;
  const responseTime = typeof responseTimeRaw === "number" ? responseTimeRaw : "--";

  const uptime = website.uptime || "--";
  const rawDate = website.last_checked || website.lastChecked;
  const lastChecked = formatDate(rawDate);

  const statusColor =
    status === "Online" ? "text-green-500" :
    status === "Warning" ? "text-yellow-500" :
    "text-red-500";

  const statusBgColor =
    status === "Online" ? "bg-green-500" :
    status === "Warning" ? "bg-yellow-500" :
    "bg-red-500";
    
  const handleDelete = () => {
    setOpen(false);
    if (window.confirm(`Delete "${name}"?`)) {
      deleteWebsite(website.id);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-xl shadow-lg border border-gray-800 h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="p-5 flex justify-between items-start gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="bg-gray-800 h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
            <Globe size={22} className="text-gray-400" />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white truncate max-w-[220px]">
              {name}
            </h3>
            <p className="text-sm text-gray-400 truncate max-w-[260px]">
              {url}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white whitespace-nowrap">
              {responseTime !== "--" ? `${responseTime} ms` : "--"}
            </span>

            <button
              onClick={() => setOpen(!open)}
              className="p-1 rounded hover:bg-gray-800"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>

          {open && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-36 z-50">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusBgColor}`} />
            <span className={`text-sm font-medium ${statusColor}`}>
              {status}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Uptime</p>
          <p className="text-sm font-medium text-gray-400">{uptime}</p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">Last Checked</p>
          <p className="text-sm font-medium text-gray-400 truncate">
            {lastChecked}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
