import React, { useContext, useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Connect_Context from '../context/ConnectContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

function formatDuration(incident) {
  if (!incident.isResolved) {
    const seconds = Math.floor((Date.now() - new Date(incident.startedAt)) / 1000);
    if (seconds < 60) return `${seconds}s (ongoing)`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m (ongoing)`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m (ongoing)`;
  }
  const s = incident.durationSeconds;
  if (!s) return '—';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export default function IncidentsPage() {
  const { incidents, websites, resolveIncident } = useContext(Connect_Context);
  const [search, setSearch] = useState('');

  // Look up website name by id
  const getWebsiteName = (websiteId) => {
    const site = websites.find(w => w.id === websiteId);
    return site ? site.name : websiteId;
  };

  const filtered = incidents.filter(inc => {
    const siteName = getWebsiteName(inc.websiteId).toLowerCase();
    const q = search.toLowerCase();
    return (
      siteName.includes(q) ||
      inc.type?.toLowerCase().includes(q) ||
      inc.errorMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Incident History</h1>
        <p className="text-gray-400 mt-1">
          View and track all website incidents and downtime events
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by website, type, or error..."
          className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <CheckCircle2 size={48} className="mb-4 text-green-500/40" />
          <p className="text-lg font-medium text-gray-400">No incidents found</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term.' : 'All your websites are running smoothly.'}
          </p>
        </div>
      )}

      {/* Incidents Table */}
      {filtered.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Website</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Started</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Duration</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Details</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50"
                >
                  {/* Website Name */}
                  <td className="p-4 text-sm font-medium text-white">
                    {getWebsiteName(incident.websiteId)}
                  </td>

                  {/* Type */}
                  <td className="p-4">
                    <span className="bg-blue-600/30 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {incident.type?.replace(/_/g, ' ') ?? 'unknown'}
                    </span>
                  </td>

                  {/* Started */}
                  <td className="p-4 text-sm text-gray-300">
                    {formatDate(incident.startedAt)}
                  </td>

                  {/* Duration */}
                  <td className="p-4 text-sm text-gray-300">
                    {formatDuration(incident)}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {!incident.isResolved ? (
                      <span className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-600/20 px-2.5 py-0.5 rounded-full w-fit">
                        <XCircle size={14} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-600/20 px-2.5 py-0.5 rounded-full w-fit">
                        <CheckCircle2 size={14} />
                        Resolved
                      </span>
                    )}
                  </td>

                  {/* Details */}
                  <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate">
                    {incident.errorMessage
                      ? incident.errorMessage
                      : incident.statusCode
                      ? `HTTP ${incident.statusCode}`
                      : '—'}
                  </td>

                  {/* Action */}
                  <td className="p-4">
                    {!incident.isResolved ? (
                      <button
                        onClick={() => resolveIncident(incident.id)}
                        className="text-xs bg-green-700/30 hover:bg-green-700/60 text-green-400 px-3 py-1 rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}