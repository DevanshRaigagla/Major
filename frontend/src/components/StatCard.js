import React from 'react';
export default function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-900 p-5 rounded-xl shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-400">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}