// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const routes = require('./routes');
const monitoringService = require('./monitoringService');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

// simple health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;
const server = http.createServer(app);

// WebSocket server at /ws
const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  // Monitoring service will add socket clients
  monitoringService.wsClients && monitoringService.wsClients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    monitoringService.wsClients && monitoringService.wsClients.delete(ws);
  });
});

// attach wss to monitoring service so it can broadcast
monitoringService.attachWebSocketServer(wss);

// start server then initialize monitoring
server.listen(port, async () => {
  console.log(`Server listening on http://localhost:${port}`);
  try {
    const defaultInterval = parseInt(process.env.CHECK_TIMEOUT_MS || '10000', 10);
    await monitoringService.initializeMonitoring(defaultInterval);
    console.log('Monitoring service initialized');
  } catch (err) {
    console.error('Failed to initialize monitoring', err);
  }
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  monitoringService.shutdown();
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  monitoringService.shutdown();
  server.close(() => process.exit(0));
});
