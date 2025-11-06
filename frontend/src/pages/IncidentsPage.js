import React from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { incidentsData } from '../data/mockData';

export default function IncidentsPage() {
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
          placeholder="Search incidents..."
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
            {incidentsData.map((incident) => (
              <tr key={incident.id} className="border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50">
                <td className="p-4">
                  <span className="bg-blue-600/30 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {incident.type}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-300">{incident.started}</td>
                <td className="p-4 text-sm text-gray-300">{incident.duration}</td>
                <td className="p-4">
                  {incident.status === 'Active' ? (
                    <span className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-600/20 px-2.5 py-0.5 rounded-full w-fit">
                      <XCircle size={14} />
                      {incident.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-xs font-medium text-green-400 bg-green-600/20 px-2.5 py-0.5 rounded-full w-fit">
                      <CheckCircle2 size={14} />
                      {incident.status}
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-300">{incident.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}