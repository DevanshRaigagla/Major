// routes.js
const express = require('express');
const storage = require('./storage');
const monitoringService = require('./monitoringService');
const router = express.Router();

/* Websites */
router.get('/websites', async (req, res) => {
  try {
    const websites = await storage.getAllWebsites();
    res.json(websites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
});

router.get('/websites/:id', async (req, res) => {
  try {
    const website = await storage.getWebsiteById(req.params.id);
    if (!website) return res.status(404).json({ error: 'Not found' });
    res.json(website);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch website' });
  }
});

router.post('/websites', async (req, res) => {
  try {
    const body = req.body;

    // 1. Save to DB first
    const created = await storage.createWebsite(body);

    // 2. Respond immediately so the client always gets the new website
    res.status(201).json(created);

    // 3. Start monitoring AFTER responding — an error here won't affect the client
    try {
      const interval = parseInt(process.env.CHECK_TIMEOUT_MS || '10000', 10);
      await monitoringService.startMonitoringForWebsite(created, interval);
    } catch (monitorErr) {
      // Log but don't crash — website is already saved and returned
      console.error('Failed to start monitoring for website:', created.id, monitorErr);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create website' });
  }
});

router.put('/websites/:id', async (req, res) => {
  try {
    const updated = await storage.updateWebsite(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update website' });
  }
});

router.delete('/websites/:id', async (req, res) => {
  try {
    await storage.deleteWebsite(req.params.id);
    monitoringService.stopMonitoringForWebsite(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete website' });
  }
});

/* Incidents */
router.get('/incidents', async (req, res) => {
  try {
    // Return all incidents (active + resolved) so the incidents page shows full history
    const incidents = await storage.getAllIncidents();
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.post('/incidents/:id/resolve', async (req, res) => {
  try {
    const updated = await storage.resolveIncident(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

/* Metrics */
router.get('/websites/:id/metrics', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const metrics = await storage.getMetricsByWebsite(req.params.id, limit);
    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/* Notification settings */
router.post('/notification-settings', async (req, res) => {
  try {
    const settings = await storage.upsertNotificationSettings(req.body);
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upsert notification settings' });
  }
});

module.exports = router;