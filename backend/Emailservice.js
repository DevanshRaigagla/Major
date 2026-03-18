// Emailservice.js
// Sends incident alert emails to the website owner using nodemailer.
// Configure SMTP credentials in your .env file.
//
// Required .env variables:
//   SMTP_HOST     e.g. smtp.gmail.com
//   SMTP_PORT     e.g. 587
//   SMTP_USER     e.g. yourapp@gmail.com
//   SMTP_PASS     e.g. your-app-password  (for Gmail: use an App Password)
//   SMTP_FROM     e.g. "UptimeMonitor <yourapp@gmail.com>"

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter — created once, reused for all emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a "website down" alert to the website owner.
 * @param {object} website  - The website object (must include .name, .url, .user_email)
 * @param {string} type     - Incident type e.g. 'connection_error', 'http_error'
 * @param {number|null} statusCode - HTTP status code if available
 * @param {string|null} errorMessage - Raw error message if available
 */
async function sendIncidentAlert(website, type, statusCode, errorMessage) {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[emailService] SMTP not configured — skipping incident email.');
    return;
  }

  const to = website.user_email;
  const siteName = website.name;
  const siteUrl = website.url;
  const detailLine = errorMessage
    ? `Error: ${errorMessage}`
    : statusCode
    ? `HTTP Status: ${statusCode}`
    : 'No additional details available.';

  const subject = `UptimeMonitor ${siteName} is DOWN`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ef4444; margin: 0;">⚠️ Website Down Alert</h2>
      </div>
      <div style="background: #16213e; padding: 24px; border-radius: 0 0 8px 8px; color: #e2e8f0;">
        <p style="font-size: 16px;">Your website <strong style="color:#60a5fa;">${siteName}</strong> is currently <strong style="color:#ef4444;">DOWN</strong>.</p>

        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; color: #94a3b8; width: 140px;">Website</td>
            <td style="padding: 8px; color: #e2e8f0;">${siteName}</td>
          </tr>
          <tr style="background: #1e2d4a;">
            <td style="padding: 8px; color: #94a3b8;">URL</td>
            <td style="padding: 8px;"><a href="${siteUrl}" style="color:#60a5fa;">${siteUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Incident Type</td>
            <td style="padding: 8px; color: #e2e8f0;">${type.replace(/_/g, ' ')}</td>
          </tr>
          <tr style="background: #1e2d4a;">
            <td style="padding: 8px; color: #94a3b8;">Details</td>
            <td style="padding: 8px; color: #fca5a5;">${detailLine}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Time</td>
            <td style="padding: 8px; color: #e2e8f0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          You are receiving this because you are monitoring <strong>${siteUrl}</strong> on UptimeMonitor.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[emailService] Incident alert sent to ${to} for "${siteName}"`);
  } catch (err) {
    // Log but never crash the monitoring service over an email failure
    console.error(`[emailService] Failed to send alert to ${to}:`, err.message);
  }
}

/**
 * Sends a "website recovered" email to the website owner.
 */
async function sendRecoveryAlert(website) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const to = website.user_email;
  const siteName = website.name;
  const siteUrl = website.url;

  const subject = `✅ [UptimeMonitor] ${siteName} is back ONLINE`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #22c55e; margin: 0;">✅ Website Recovered</h2>
      </div>
      <div style="background: #16213e; padding: 24px; border-radius: 0 0 8px 8px; color: #e2e8f0;">
        <p style="font-size: 16px;">Your website <strong style="color:#60a5fa;">${siteName}</strong> is back <strong style="color:#22c55e;">ONLINE</strong>.</p>

        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; color: #94a3b8; width: 140px;">Website</td>
            <td style="padding: 8px; color: #e2e8f0;">${siteName}</td>
          </tr>
          <tr style="background: #1e2d4a;">
            <td style="padding: 8px; color: #94a3b8;">URL</td>
            <td style="padding: 8px;"><a href="${siteUrl}" style="color:#60a5fa;">${siteUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #94a3b8;">Recovered At</td>
            <td style="padding: 8px; color: #e2e8f0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
          You are receiving this because you are monitoring <strong>${siteUrl}</strong> on UptimeMonitor.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[emailService] Recovery alert sent to ${to} for "${siteName}"`);
  } catch (err) {
    console.error(`[emailService] Failed to send recovery alert to ${to}:`, err.message);
  }
}

// sendIncidentAlert(
//   {
//     name: "Example Site",
//     url: "https://example.com",
//     user_email: "yash.limbachiya@somaiya.edu" }, "Your site is down", 500, "Connection timed out");

module.exports = { sendIncidentAlert, sendRecoveryAlert };