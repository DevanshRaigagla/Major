// storage.js
const db = require('./db');
const { uuid } = require('./utils');

async function query(sql, params) {
  const [rows] = await db.query(sql, params);
  return rows;
}

/* Websites */
async function getAllWebsites() {
  return await query('SELECT * FROM websites ORDER BY createdAt DESC');
}

async function getWebsiteById(id) {
  const rows = await query('SELECT * FROM websites WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

async function createWebsite({ name, url, expectedStatus = 200, timeoutMs = 5000, isActive = true }) {
  const id = uuid();
  await query(
    `INSERT INTO websites (id,name,url,expectedStatus,timeoutMs,isActive) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, url, expectedStatus, timeoutMs, isActive ? 1 : 0]
  );
  return getWebsiteById(id);
}

async function updateWebsite(id, fields = {}) {
  const set = [];
  const params = [];
  for (const [k, v] of Object.entries(fields)) {
    set.push(`${k} = ?`);
    params.push(v);
  }
  if (set.length === 0) return getWebsiteById(id);
  params.push(id);
  await query(`UPDATE websites SET ${set.join(', ')} WHERE id = ?`, params);
  return getWebsiteById(id);
}

async function deleteWebsite(id) {
  await query('DELETE FROM websites WHERE id = ?', [id]);
  return true;
}

/* Incidents */
async function createIncident({ websiteId, type, statusCode = null, errorMessage = null }) {
  const id = uuid();
  await query(
    `INSERT INTO incidents (id,websiteId,type,statusCode,errorMessage) VALUES (?,?,?,?,?)`,
    [id, websiteId, type, statusCode, errorMessage]
  );
  const rows = await query('SELECT * FROM incidents WHERE id = ?', [id]);
  return rows[0];
}

async function getActiveIncidents() {
  return await query('SELECT * FROM incidents WHERE isResolved = 0 ORDER BY startedAt DESC');
}

async function resolveIncident(id) {
  // compute durationSeconds
  const rows = await query('SELECT * FROM incidents WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const incident = rows[0];
  if (incident.isResolved) return incident;

  const resolvedAt = new Date();
  const startedAt = new Date(incident.startedAt);
  const duration = Math.floor((resolvedAt - startedAt) / 1000);

  await query(
    `UPDATE incidents SET isResolved = 1, resolvedAt = ?, durationSeconds = ? WHERE id = ?`,
    [resolvedAt, duration, id]
  );
  const updated = await query('SELECT * FROM incidents WHERE id = ?', [id]);
  return updated[0];
}

/* Metrics */
async function createMetric({ websiteId, responseTimeMs, statusCode = null }) {
  const id = uuid();
  await query(
    `INSERT INTO metrics (id,websiteId,responseTimeMs,statusCode) VALUES (?,?,?,?)`,
    [id, websiteId, responseTimeMs, statusCode]
  );
  const rows = await query('SELECT * FROM metrics WHERE id = ?', [id]);
  return rows[0];
}

async function getMetricsByWebsite(websiteId, limit = 100) {
  return await query(
    'SELECT * FROM metrics WHERE websiteId = ? ORDER BY createdAt DESC LIMIT ?',
    [websiteId, limit]
  );
}

/* Notification settings */
async function upsertNotificationSettings({ websiteId, email = null, smsNumber = null, notifyOn = 'both' }) {
  // check existing
  const rows = await query('SELECT * FROM notification_settings WHERE websiteId = ? LIMIT 1', [websiteId]);
  if (rows[0]) {
    await query(
      `UPDATE notification_settings SET email = ?, smsNumber = ?, notifyOn = ?, updatedAt = CURRENT_TIMESTAMP WHERE websiteId = ?`,
      [email, smsNumber, notifyOn, websiteId]
    );
    const updated = await query('SELECT * FROM notification_settings WHERE websiteId = ? LIMIT 1', [websiteId]);
    return updated[0];
  } else {
    const id = uuid();
    await query(
      `INSERT INTO notification_settings (id,websiteId,email,smsNumber,notifyOn) VALUES (?,?,?,?,?)`,
      [id, websiteId, email, smsNumber, notifyOn]
    );
    const created = await query('SELECT * FROM notification_settings WHERE id = ? LIMIT 1', [id]);
    return created[0];
  }
}

module.exports = {
  getAllWebsites,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  createIncident,
  getActiveIncidents,
  resolveIncident,
  createMetric,
  getMetricsByWebsite,
  upsertNotificationSettings
};
