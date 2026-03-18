// monitoringService.js

const axios = require("axios");
const storage = require("./storage");
const emailService = require("./Emailservice");

// Locations configuration — used as fallback (no DB locations table)
const LOCATIONS = [
  {
    name: "Mumbai",
    proxy: null
  },
  // Uncomment and configure if you want a second location
  // {
  //   name: "Dubai",
  //   proxy: { host: "74.208.234.198", port: 443 }
  // }
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

  // MAIN WEBSITE CHECK — always uses hardcoded LOCATIONS (no DB lookup needed)
  async checkWebsite(website) {
    for (const location of LOCATIONS) {
      await this.checkFromLocation(website, location);
    }
  }

  // CHECK WEBSITE FROM A SINGLE LOCATION
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

      if (location.proxy) {
        axiosConfig.proxy = {
          host: location.proxy.host,
          port: location.proxy.port
        };
      }

      const resp = await axios.get(website.url, axiosConfig);
      const responseTime = Date.now() - start;
      const statusCode = resp.status;

      // Save metric to DB
      const metric = await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode,
        location: location.name
      });
      // Broadcast metric for live graphs
      this.broadcast({ type: "metric", data: metric });

      // Determine status from HTTP response
      let newStatus = "online";
      if (statusCode < 200 || statusCode >= 400) {
        newStatus = "down";
      } else if (responseTime > (website.timeoutMs || 8000)) {
        newStatus = "warning";
      }

      // Broadcast real-time update to all connected WebSocket clients
      this.broadcast({
        type: "website_update",
        data: {
          ...website,
          status: newStatus,
          responseTime,
          lastChecked: new Date(),
          location: location.name
        }
      });

      // Create or resolve incidents based on status
      await this.handleIncident(website, newStatus, statusCode, null);

    } catch (err) {
      const responseTime = Date.now() - start;

      const metric = await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode: null,
        location: location.name
      });
      this.broadcast({ type: "metric", data: metric });

      this.broadcast({
        type: "website_update",
        data: {
          ...website,
          status: "down",
          responseTime,
          lastChecked: new Date(),
          location: location.name
        }
      });

      await this.handleIncident(website, "down", null, err.message);
    }
  }

  // Create an incident when site goes down, resolve it when it comes back up
  async handleIncident(website, newStatus, statusCode, errorMessage) {
    try {
      const activeIncidents = await storage.getActiveIncidentsForWebsite(website.id);

      if (newStatus === "down" && activeIncidents.length === 0) {
        // Site just went down — open a new incident
        await storage.createIncident({
          websiteId: website.id,
          type: errorMessage ? "connection_error" : "http_error",
          statusCode,
          errorMessage
        });
        this.broadcast({
          type: "incident_created",
          data: { websiteId: website.id, type: "http_error", statusCode }
        });

        // Email the website owner — website.user_email comes from the DB row
        await emailService.sendIncidentAlert(website, errorMessage ? "connection_error" : "http_error", statusCode, errorMessage);
      } else if (newStatus === "online" && activeIncidents.length > 0) {
        // Site recovered — resolve all open incidents
        for (const incident of activeIncidents) {
          const resolved = await storage.resolveIncident(incident.id);
          this.broadcast({ type: "incident_resolved", data: resolved });
          // Email the owner that the site has recovered
          await emailService.sendRecoveryAlert(website);
        }
      }
    } catch (e) {
      console.error("handleIncident error:", e.message);
    }
  }

  async startMonitoringForWebsite(website, intervalMs) {
    if (!website.isActive) return;

    // Clear any existing interval for this website
    if (this.intervals.has(website.id)) {
      clearInterval(this.intervals.get(website.id));
    }

    // Run immediately, then on interval
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
    // Pass null to get all websites across all users (monitoring runs globally)
    const websites = await storage.getAllWebsites(null);
    for (const website of websites) {
      if (website.isActive) {
        const interval = website.intervalMs || defaultIntervalMs;
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