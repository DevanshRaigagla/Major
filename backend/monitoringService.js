// monitoringService.js
const axios = require('axios');
const storage = require('./storage');
const { WebSocketServer } = require('ws');

class MonitoringService {
  constructor() {
    this.intervals = new Map(); // websiteId -> timer
    this.wsClients = new Set();
    this.wss = null; // optional WebSocketServer if started here
  }

  attachWebSocketServer(wss) {
    this.wss = wss;
    wss.on('connection', ws => {
      this.wsClients.add(ws);
      ws.on('close', () => this.wsClients.delete(ws));
    });
  }

  broadcast(message) {
    const payload = JSON.stringify(message);
    for (const ws of this.wsClients) {
      if (ws.readyState === 1) {
        try { ws.send(payload); } catch (e) {}
      }
    }
  }

  async checkWebsite(website) {
    const start = Date.now();
    try {
      const resp = await axios.get(website.url, { timeout: website.timeoutMs || 5000 });
      const responseTime = Date.now() - start;
      const statusCode = resp.status;

      // Save metric
      await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode
      });

      // Determine status and handle incidents
      let newStatus = 'online';
      if (statusCode !== (website.expectedStatus || 200)) newStatus = 'warning';
      if (responseTime > (website.timeoutMs || 5000)) newStatus = 'warning';

      if (newStatus === 'warning') {
        // create incident of type slow_response if not existing
        await storage.createIncident({
          websiteId: website.id,
          type: 'slow_response',
          statusCode,
          errorMessage: null
        });
        this.broadcast({ type: 'incident_created', data: { websiteId: website.id, statusCode, responseTime } });
      }

      // broadcast metric update
      this.broadcast({ type: 'metric', data: { websiteId: website.id, responseTime, statusCode } });

    } catch (err) {
      const responseTime = Date.now() - start;
      const statusCode = err.response ? err.response.status : null;
      const errorMessage = err.code || err.message || 'unknown error';

      // Save metric (if we have a time)
      await storage.createMetric({
        websiteId: website.id,
        responseTimeMs: responseTime,
        statusCode
      });

      // Create incident for downtime
      await storage.createIncident({
        websiteId: website.id,
        type: 'downtime',
        statusCode,
        errorMessage: String(errorMessage)
      });

      this.broadcast({ type: 'incident_created', data: { websiteId: website.id, statusCode, errorMessage } });
    }
  }

  async startMonitoringForWebsite(website, intervalMs) {
    if (!website.isActive) return;
    // clear existing
    if (this.intervals.has(website.id)) {
      clearInterval(this.intervals.get(website.id));
    }
    const check = async () => {
      await this.checkWebsite(website);
    };
    // run once immediately, then on interval
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
    const webs = await storage.getAllWebsites();
    for (const w of webs) {
      const ms = w.timeoutMs || defaultIntervalMs;
      if (w.isActive) await this.startMonitoringForWebsite(w, ms);
    }
  }

  shutdown() {
    for (const t of this.intervals.values()) clearInterval(t);
    this.intervals.clear();
  }
}

module.exports = new MonitoringService();
