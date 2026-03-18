import React, { useState, useEffect, useRef } from "react";
import Connect_Context from "./ConnectContext";
import axios from "axios";

const API_URL = "http://localhost:4000/api";
const WS_URL = "ws://localhost:4000/ws";

export const ApiProvider = ({ children }) => {
  const [websites, setWebsites] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sitesRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/websites`),
        axios.get(`${API_URL}/incidents`),
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
    try {
      const res = await axios.get(`${API_URL}/websites/${websiteId}/metrics`);
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
    try {
      const res = await axios.post(`${API_URL}/websites`, {
        name,
        url,
        isActive: true,
      });

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
    if (!window.confirm("Are you sure you want to delete this website?")) return;
    try {
      await axios.delete(`${API_URL}/websites/${websiteId}`);
      setWebsites((prev) => prev.filter((w) => w.id !== websiteId));
    } catch (err) {
      console.error("Failed to delete website:", err);
      alert("Error: Could not delete website.");
    }
  };

  const resolveIncident = async (incidentId) => {
    try {
      await axios.post(`${API_URL}/incidents/${incidentId}/resolve`);
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          // Handle new metrics for the graph
          case 'metric':
            const newMetric = message.data;
            setMetrics(prev => {
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
                // Add new
                return [updatedWebsite, ...prevWebsites];
              }
            });
            break;
          case "incident_created":
            setIncidents((prev) => [message.data, ...prev]);
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

  useEffect(() => {
    fetchAllData();
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

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