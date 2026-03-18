import React, { useState, useEffect } from "react";

export default function AddWebsiteModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Fetch locations when modal opens
  useEffect(() => {
    if (!open) return;

    fetch("http://localhost:4000/api/locations")
      .then((res) => res.json())
      .then((data) => {
        setLocations(data);

        // Optional: auto select first location (Mumbai)
        if (data.length > 0) {
          setSelectedLocations([data[0].id]);
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, [open]);

  if (!open) return null;

  const handleLocationChange = (id) => {
    setSelectedLocations((prev) => {
      if (prev.includes(id)) {
        return prev.filter((l) => l !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubmit = () => {
    if (!name || !url) {
      alert("Please fill all fields");
      return;
    }

    // if (selectedLocations.length === 0) {
    //   alert("Select at least one monitoring location");
    //   return;
    // }

    // Let the parent (DashboardPage/WebsitesPage) handle closing
    // so the modal stays open if the API call fails
    onSubmit({ name, url });

    // Reset form fields
    setName("");
    setUrl("");
    setSelectedLocations([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-xl">

        <h2 className="text-xl font-semibold text-white mb-4">
          Add Website
        </h2>

        <div className="space-y-4">

          {/* Website Name */}
          <div>
            <label className="text-sm text-gray-400">Website Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="text-sm text-gray-400">Website URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            />
          </div>

          {/* Monitoring Locations */}
          {/* <div>
            <label className="text-sm text-gray-400">
              Monitoring Locations
            </label>

            <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">

              {locations.length === 0 && (
                <p className="text-gray-500 text-sm">Loading locations...</p>
              )}

              {locations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-2 text-gray-300 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(loc.id)}
                    onChange={() => handleLocationChange(loc.id)}
                  />

                  {loc.name}
                </label>
              ))}

            </div>
          </div> */}

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Add Website
          </button>

        </div>

      </div>
    </div>
  );
}