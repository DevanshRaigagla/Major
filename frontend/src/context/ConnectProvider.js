import { useEffect, useState } from "react";
import Connect_Context from "./ConnectContext";

const API_URL = "http://localhost:5000"; // change if backend port different

export default function ConnectProvider({ children }) {
  const [websites, setWebsites] = useState([]);

  // Fetch websites
  const fetchWebsites = async () => {
    const res = await fetch(`${API_URL}/websites`);
    const data = await res.json();
    setWebsites(data);
  };

  // Create website
  const createWebsite = async (website) => {
    await fetch(`${API_URL}/websites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(website),
    });

    fetchWebsites();
  };

  // ✅ Delete website
  const deleteWebsite = async (id) => {
    await fetch(`${API_URL}/websites/${id}`, {
      method: "DELETE",
    });

    setWebsites(prev => prev.filter(w => w.id !== id));
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  return (
    <Connect_Context.Provider
      value={{
        websites,
        createWebsite,
        deleteWebsite,
      }}
    >
      {children}
    </Connect_Context.Provider>
  );
}
