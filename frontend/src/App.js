import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import WebsitesPage from './pages/WebsitesPage';
import IncidentsPage from './pages/IncidentsPage';
import SettingsPage from './pages/SettingsPage';

/**
 * This is the main App component.
 * Its only job is to define the application's URL structure.
 * The <Layout> component provides the sidebar and header.
 * The <Navigate> component redirects the base "/" path to "/dashboard".
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Child routes are rendered into the Layout's <Outlet> */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="websites" element={<WebsitesPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* You can add a 404 page here later */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}