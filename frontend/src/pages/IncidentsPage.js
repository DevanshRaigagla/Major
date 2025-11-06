import React, { useContext, useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import Connect_Context from '../context/ConnectContext'; // Import context

export default function IncidentsPage() {
  // Get real data from the Context
  const { incidents, loading, error, resolveIncident } = useContext(Connect_Context);
  const [searchTerm, setSearchTerm] = useState('');

  // Format date string to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Format duration from backend's durationSeconds
  const formatDuration = (seconds) => {
    // isResolved=0 means it's active, duration will be null
    if (seconds === null || seconds === undefined) return "Ongoing"; 
    if (seconds < 60) return `${seconds} sec`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    return `${Math.floor(seconds / 3600)} hr`;
  };

  // Filter incidents (handles empty array)
  const filteredIncidents = (incidents || []).filter(i => 
    i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.errorMessage && i.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          placeholder="Search incidents by type or error..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-lg py-2.5 px-4 pl-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Incidents Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Started</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Duration</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Details</th>
            </tr>
          </thead>
          <tbody>
            {/* Handle Loading, Error, and Empty States */}
            {loading && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">Loading incidents...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-red-400">Error: {error}</td>
              </tr>
            )}
            {!loading && !error && incidents.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No incidents recorded. Looks like everything is running smoothly!
                </td>
              </tr>
            )}

            {/* Render real data */}
            {filteredIncidents.map((incident) => (
              <tr key={incident.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    incident.type === 'downtime' 
                    ? 'bg-red-600/30 text-red-300' 
                    : 'bg-yellow-600/30 text-yellow-300'
                  }`}>
                    {incident.type === 'downtime' ? 'Downtime' : 'Slow Response'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-300">{formatDate(incident.startedAt)}</td>
                <td className="p-4 text-sm text-gray-300">{formatDuration(incident.durationSeconds)}</td>
                <td className="p-4">
                  {/* Use backend's 'isResolved' boolean field */}
                  {!incident.isResolved ? (
                    <span 
                      onClick={() => resolveIncident(incident.id)}
                      className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-600/20 px-2.5 py-1 rounded-full w-fit cursor-pointer hover:bg-red-600/40"
                      title="Click to mark as resolved"
                    >
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
                <td className="p-4 text-sm text-gray-300">
                  {incident.statusCode && `Status: ${incident.statusCode}. `}
                  {incident.errorMessage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}