// We need to import the icons here since they are JSX
import React from 'react';
import { Globe2, Wifi, TrendingUp, Timer } from 'lucide-react';

export const statsData = [
  { title: 'Total Websites', value: '4', icon: <Globe2 size={20} className="text-gray-400" /> },
  { title: 'Online', value: '1', icon: <Wifi size={20} className="text-gray-400" /> },
  { title: 'Average Uptime', value: '82.29%', icon: <TrendingUp size={20} className="text-gray-400" /> },
  { title: 'Avg Response Time', value: '3840ms', icon: <Timer size={20} className="text-gray-400" /> },
];

export const websitesData = [
  { id: 1, name: 'Youtube', url: 'https://youtube.com', status: 'Online', responseTime: '327ms', uptime: '100.00%', lastChecked: '1 minute ago' },
  { id: 2, name: 'relaible', url: 'https://www.reliable.com.hk/', status: 'Warning', responseTime: '8221ms', uptime: '100.00%', lastChecked: '1 minute ago' },
  { id: 3, name: 'relaible', url: 'https://www.reliable.com.hk/', status: 'Warning', responseTime: '6121ms', uptime: '100.00%', lastChecked: '1 minute ago' },
  { id: 4, name: 'kj', url: 'https://kjsim.somaiya.edu/en/', status: 'Warning', responseTime: '692ms', uptime: '29.15%', lastChecked: '1 minute ago' },
];

export const incidentsData = [
  { id: 1, type: 'Slow Response', started: 'Nov 06, 15:21:42', duration: 'Ongoing', status: 'Active', details: 'Status: 200' },
  { id: 2, type: 'Slow Response', started: 'Nov 06, 15:21:42', duration: 'Ongoing', status: 'Active', details: 'Status: 200' },
  { id: 3, type: 'Slow Response', started: 'Nov 06, 14:21:40', duration: 'half a minute', status: 'Resolved', details: 'Status: 200' },
  { id: 4, type: 'Slow Response', started: 'Nov 06, 14:19:09', duration: 'half a minute', status: 'Resolved', details: 'Status: 200' },
  { id: 5, type: 'Slow Response', started: 'Nov 06, 14:03:38', duration: 'Ongoing', status: 'Active', details: 'Status: 403, Client error: 403' },
  { id: 6, type: 'Slow Response', started: 'Nov 06, 10:08:59', duration: 'half a minute', status: 'Resolved', details: 'Status: 200' },
  { id: 7, type: 'Slow Response', started: 'Nov 06, 09:52:47', duration: 'half a minute', status: 'Resolved', details: 'Status: 200' },
];