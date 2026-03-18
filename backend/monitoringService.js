// monitoringService.js

const axios = require("axios");
const storage = require("./storage");

// Locations configuration
const LOCATIONS = [
  {
    name: "Mumbai",
    proxy: null
  },
  {
    name: "Dubai",
    proxy: {
      host: "74.208.234.198",
      port: 443
    }
  }
];

class MonitoringService {
  constructor() {
    this.intervals = new Map();
    this.wsClients = new Set();
    this.wss = null;
  }

  attachWebSocketServer(wss) {
    this.wss = wss;

    wss.on("connection", ws => {
      this.wsClients.add(ws);

      ws.on("close", () => {
        this.wsClients.delete(ws);
      });
    });
  }

  broadcast(message) {
    const payload = JSON.stringify(message);

    for (const ws of this.wsClients) {
      if (ws.readyState === 1) {
        try {
          ws.send(payload);
        } catch (e) {}
      }
    }
  }

  // MAIN WEBSITE CHECK
  async checkWebsite(website) {

    let locations = await storage.getLocationsForWebsite(website.id);

    // fallback if no locations selected
    if (!locations || locations.length === 0) {
      locations = LOCATIONS;
    }

    for (const location of locations) {
      await this.checkFromLocation(website, location);
    }
  }

  // CHECK WEBSITE FROM A LOCATION
  async checkFromLocation(website, location) {

    const start = Date.now();

    try {

      const axiosConfig = {
        timeout: website.timeoutMs || 8000,
        maxRedirects: 5,
        validateStatus: () => true,
        headers: {
          "User-Agent": `Uptime Monitor Bot (${location.name})`
        }
      };

      // Apply proxy if available
      if (location.proxy) {
        axiosConfig.proxy = {
          host: location.proxy.host,
          port: location.proxy.port
        };
      }

      const resp = await axios.get(website.url, axiosConfig);

      const responseTime = Date.now() - start;
      const statusCode = resp.status;

      await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode,
        location: location.name
      });

      let newStatus = "online";

      if (statusCode < 200 || statusCode >= 400) {
        newStatus = "down";
      }

      if (responseTime > (website.timeoutMs || 8000)) {
        newStatus = "warning";
      }

      await storage.updateWebsite(website.id, {
        status: newStatus,
        lastChecked: new Date()
      });

      this.broadcast({
        type: "website_update",
        data: {
          ...website,
          status: newStatus,
          responseTime,
          location: location.name
        }
      });

    } catch (err) {

      const responseTime = Date.now() - start;

      await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode: null,
        location: location.name
      });

      await storage.updateWebsite(website.id, {
        status: "down",
        lastChecked: new Date()
      });

      this.broadcast({
        type: "website_update",
        data: {
          ...website,
          status: "down",
          responseTime,
          location: location.name
        }
      });
    }
  }

  async startMonitoringForWebsite(website, intervalMs) {

    if (!website.isActive) return;

    if (this.intervals.has(website.id)) {
      clearInterval(this.intervals.get(website.id));
    }

    const check = async () => {
      await this.checkWebsite(website);
    };

    await check();

    const timer = setInterval(check, intervalMs);

    this.intervals.set(website.id, timer);
  }

  stopMonitoringForWebsite(websiteId) {

    if (this.intervals.has(websiteId)) {
      clearInterval(this.intervals.get(websiteId));
      this.intervals.delete(websiteId);
    }
  }

  async initializeMonitoring(defaultIntervalMs = 10000) {

    const websites = await storage.getAllWebsites();

    for (const website of websites) {

      const interval = website.intervalMs || defaultIntervalMs;

      if (website.isActive) {
        await this.startMonitoringForWebsite(website, interval);
      }
    }
  }

  shutdown() {

    for (const timer of this.intervals.values()) {
      clearInterval(timer);
    }

    this.intervals.clear();
  }
}

module.exports = new MonitoringService();