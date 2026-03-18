import React, { useState, useEffect, useContext } from "react";
import Connect_Context from "./ConnectContext";
import AuthContext from "./AuthContext";
import axios from "axios";

const API_URL = "http://localhost:4000/api";
const WS_URL = "ws://localhost:4000/ws";

export const ApiProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [websites, setWebsites] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({}); // Stores metrics by websiteId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches all initial data from the backend API
   */
  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [sitesRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/websites`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/incidents`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setWebsites(sitesRes.data || []);
      setIncidents(incidentsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsForWebsite = async (websiteId) => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/websites/${websiteId}/metrics`, { headers: { Authorization: `Bearer ${token}` } });
      setMetrics((prev) => ({
        ...prev,
        [websiteId]: res.data || [],
      }));
    } catch (err) {
      console.error(`Failed to fetch metrics for ${websiteId}:`, err);
    }
  };

  /**
   * Creates a new website, saves to DB, and instantly shows it in the UI.
   * Returns the created website object, or null on failure.
   */
  const createWebsite = async ({ name, url }) => {
    if (!token) return null;
    try {
      const res = await axios.post(`${API_URL}/websites`, {
        name,
        url,
        isActive: true,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const newWebsite = res.data;

      // Instantly add to UI — deduplicated in case WebSocket also fires
      setWebsites((prev) => {
        const alreadyExists = prev.some((w) => w.id === newWebsite.id);
        if (alreadyExists) return prev;
        return [newWebsite, ...prev];
      });

      return newWebsite;
    } catch (err) {
      console.log("Failed to create website:", err);
      const message = err.response?.data?.error || "Could not create website.";
      alert(`Error: ${message}`);
      return null;
    }
  };

  const deleteWebsite = async (websiteId) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this website?")) return;
    try {
      await axios.delete(`${API_URL}/websites/${websiteId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
    } catch (err) {
      console.error("Failed to delete website:", err);
      alert("Error: Could not delete website.");
    }
  };

  const resolveIncident = async (incidentId) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_URL}/incidents/${incidentId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state immediately — don't rely solely on WebSocket
      const resolved = res.data;
      setIncidents((prev) =>
        prev.map((i) => (i.id === resolved.id ? resolved : i))
      );
    } catch (err) {
      console.error("Failed to resolve incident:", err);
      alert("Error: Could not resolve incident.");
    }
  };

  // --- WebSocket and Initial Data Load Effect ---
  useEffect(() => {
    if (!token) {
      setWebsites([]);
      setIncidents([]);
      setMetrics({});
      setLoading(false); // Ensure loading is false when no token
      return;
    }

    // 1. Fetch initial data
    fetchAllData();

    // 2. Connect to WebSocket
    let ws;
    const connectWebSocket = () => {
      // Only connect if token exists
      if (!token) return;

      // Close existing connection if any
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }

      ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => console.log("WebSocket connected");

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          switch (message.type) {
            // Handle new metrics for the graph
            case 'metric':
              const newMetric = message.data;
              setMetrics(prev => {
                // Only update metrics for websites currently in the context
                if (!prev[newMetric.websiteId] && !websites.some(w => w.id === newMetric.websiteId)) {
                  return prev;
                }
                const currentList = prev[newMetric.websiteId] || [];
                // Add to beginning of array (assuming descending sort like API)
                return {
                  ...prev,
                  [newMetric.websiteId]: [newMetric, ...currentList].slice(0, 100)
                };
              });
              break;

            // Handle website status/response time update
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
                  // Do not add new websites from websocket to prevent leaking other users' data
                  return prevWebsites;
                }
              });
              break;
            case "incident_created":
              // Only add incident if it belongs to a website the user owns
              setWebsites(currentWebsites => {
                if (currentWebsites.some(w => w.id === message.data.websiteId)) {
                  setIncidents((prev) => [message.data, ...prev]);
                }
                return currentWebsites;
              });
              break;
            case "incident_resolved":
              setIncidents((prev) =>
                prev.map((i) => (i.id === message.data.id ? message.data : i))
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
        console.log("WebSocket disconnected. Reconnecting in 3s...");
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent reconnect on intentional close
        ws.close();
      }
    };
  }, [token]); // Re-run effect when token changes

  const providerValue = {
    websites, incidents, metrics, loading, error,
    fetchAllData, fetchMetricsForWebsite,
    createWebsite, deleteWebsite, resolveIncident,
  };

  return (
    <Connect_Context.Provider value={providerValue}>
      {children}
    </Connect_Context.Provider>
  );
};