// routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const storage = require('./storage');
const monitoringService = require('./monitoringService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

/* Auth */
router.post('/auth/register', async (req, res) => {
  try {
    const { user_email, password } = req.body;
    if (!user_email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const existing = await storage.getUserByEmail(user_email);
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    
    const hashed = await bcrypt.hash(password, 10);
    await storage.createUser(user_email, hashed);
    
    const token = jwt.sign({ user_email }, JWT_SECRET, { expiresIn: '2d' });
    res.json({ token, user_email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { user_email, password } = req.body;
    const user = await storage.getUserByEmail(user_email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ user_email: user.user_email }, JWT_SECRET, { expiresIn: '2d' });
    res.json({ token, user_email: user.user_email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Protect all lower routes
router.use(authenticateToken);

/* Websites */
router.get('/websites', async (req, res) => {
  try {
    const websites = await storage.getAllWebsites(req.user.user_email);
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
    body.user_email = req.user.user_email;

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
    // Return all incidents (active + resolved) scoped to the logged-in user's websites
    const incidents = await storage.getAllIncidents(req.user.user_email);
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