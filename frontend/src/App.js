import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import WebsitesPage from './pages/WebsitesPage';
import IncidentsPage from './pages/IncidentsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AuthContext from './context/AuthContext';

function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? children : <Navigate to="/login" replace />;
}

/**
 * This is the main App component.
 * Its only job is to define the application's URL structure.
 * The <Layout> component provides the sidebar and header.
 * The <Navigate> component redirects the base "/" path to "/dashboard".
 */
export default function App() {
  const { token } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <SignupPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
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