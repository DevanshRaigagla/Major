import React, { useState, useEffect, use } from "react";
import Connect_Context from "./ConnectContext";
import axios from "axios";

// --- API and WebSocket Configuration ---
// Make sure your backend is running on port 4000 as defined in your server.js
const API_URL = "http://localhost:4000/api";
const WS_URL = "ws://localhost:4000/ws";

export const ApiProvider = ({ children }) => {
  const [websites, setWebsites] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({}); // Stores metrics by websiteId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all initial data from the backend API
   */
  const fetchAllData = async () => {
  setLoading(true);
  setError(null);
  try {
    const [sitesRes, incidentsRes] = await Promise.all([
      axios.get(`${API_URL}/websites`),
      axios.get(`${API_URL}/incidents`)
    ]);

    console.log("Fetched websites:", sitesRes.data);

    // Filter out websites with null name or url
    const filteredWebsites = (sitesRes.data || []).filter(
      w => w.name && w.url
    );

    setWebsites(filteredWebsites);
    setIncidents(incidentsRes.data || []);
    
  } catch (err) {
    console.error("Failed to fetch initial data:", err);
    setError(err.message || "Could not connect to the server.");
  } finally {
    setLoading(false);
  }
};


  /**
   * Fetches metrics for a single website
   */
  const fetchMetricsForWebsite = async (websiteId) => {
    try {
      const res = await axios.get(`${API_URL}/websites/${websiteId}/metrics`);
      setMetrics(prev => ({
        ...prev,
        [websiteId]: res.data || []
      }));
    } catch (err) {
      console.error(`Failed to fetch metrics for ${websiteId}:`, err);
    }
  };

  /**
   * Creates a new website
   */
  const createWebsite = async ({ name, url }) => {
    try {
      // The backend will create the website and the monitoring service
      // will broadcast a 'website_update' message,
      // which our WebSocket listener will pick up.
      await axios.post(`${API_URL}/websites`, { name, url, isActive: true });
      // We don't need to manually add it to state, the websocket will!
    } catch (err) {
      console.error("Failed to create website:", err);
      alert("Error: Could not create website."); // Use a modal in production
    }
  };

  /**
   * Deletes a website
   */
  const deleteWebsite = async (websiteId) => {
    if (!window.confirm("Are you sure you want to delete this website?")) return;
    
    try {
      await axios.delete(`${API_URL}/websites/${websiteId}`);
      // The websocket doesn't have a "delete" message,
      // so we'll manually remove it from state.
      setWebsites(prev => prev.filter(w => w.id !== websiteId));
    } catch (err) {
      console.error("Failed to delete website:", err);
      alert("Error: Could not delete website.");
    }
  };
  
  /**
   * Resolves an incident
   */
  const resolveIncident = async (incidentId) => {
    try {
      await axios.post(`${API_URL}/incidents/${incidentId}/resolve`);
      // The backend will broadcast 'incident_resolved',
      // which the websocket listener will handle.
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  // --- WebSocket and Initial Data Load Effect ---
  useEffect(() => {
    // 1. Fetch initial data
    fetchAllData();

    // 2. Connect to WebSocket
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          // This case is from your monitoringService.js
          case 'metric': 
          case 'website_update':
            const updatedWebsite = message.data;
            setWebsites(prevWebsites => {
              const exists = prevWebsites.some(w => w.id === updatedWebsite.id);
              if (exists) {
                // Update existing
                return prevWebsites.map(w => 
                  w.id === updatedWebsite.id ? { ...w, ...updatedWebsite } : w
                );
              } else {
                // Add new
                return [updatedWebsite, ...prevWebsites];
              }
            });
            break;

          // This case is from your monitoringService.js
          case 'incident_created':
            const newIncident = message.data;
            setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
            break;
            
          // This case is from your backend (if you add it)
          case 'incident_resolved':
            const resolvedIncident = message.data;
            setIncidents(prevIncidents => 
              prevIncidents.map(i => 
                i.id === resolvedIncident.id ? resolvedIncident : i
              )
            );
            break;
            
          default:
            console.log("Unknown WebSocket message type:", message.type);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected. Attempting to reconnect...");
      // Simple reconnect logic
      setTimeout(() => {
        // This is a simple way to re-trigger the effect
        fetchAllData(); 
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []); // Runs only once on component mount

  // Provide state and functions to the rest of the app
  const providerValue = {
    websites,
    incidents,
    metrics,
    loading,
    error,
    fetchAllData,
    fetchMetricsForWebsite,
    createWebsite,
    deleteWebsite,
    resolveIncident,
  };

  return (
    <Connect_Context.Provider value={providerValue}>
      {children}
    </Connect_Context.Provider>
  );
};