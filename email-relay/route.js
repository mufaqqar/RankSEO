// Next.js (App Router) relay for the RankSEO Chrome extension — "Email report".
//
// Copy this file into your Next.js project at:
//   app/api/rankseo/send-report/route.js
//
// Then:
//   1) `npm i nodemailer`
//   2) Add these env vars (see .env.example):
//        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//        SMTP_SECURE, MAIL_FROM, RANKSEO_RELAY_TOKEN
//   3) In the extension: Settings → "Email Report (SMTP Relay)" → paste
//        endpoint URL  https://yourdomain.com/api/rankseo/send-report
//        shared token  RANKSEO_RELAY_TOKEN's value
//
// The extension sends a JSON POST with `Authorization: Bearer <token>`.
// SMTP credentials NEVER leave this server.
//
// Self-hosted only. Vercel limits request bodies to ~4.5 MB — a full
// audit PDF usually fits (base64 ~1.4x PDF size), but very large PDFs
// will be rejected with 413.

import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOKEN = process.env.RANKSEO_RELAY_TOKEN || '';
const MAX_BODY = 14_000_000;          // chars of base64 (~10 MB binary)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit (single-instance deployments).
const hits = new Map();               // ip -> { times: [ms...], reset: ms }
const RATE_WINDOW = 60_000;           // 1 minute
const RATE_MAX = 20;                  // sends per minute per IP

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { times: [] };
  rec.times = rec.times.filter((t) => now - t < RATE_WINDOW);
  if (rec.times.length >= RATE_MAX) {
    hits.set(ip, rec);
    return true;
  }
  rec.times.push(now);
  hits.set(ip, rec);
  return false;
}

function isHex(s) {
  if (typeof s !== 'string' || s.length === 0 || s.length % 2 !== 0) return false;
  return /^[0-9a-f]+$/i.test(s);
}

function safeEqual(a, b) {
  // Minimal constant-time comparison (a = expected, b = supplied).
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(res, status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function GET() {
  return json(new Response(), 405, { ok: false, error: 'Method not allowed' });
}

export async function POST(req, ctx) {
  try {
    const ip =
      (ctx?.nextUrl?.headers?.get?.('x-forwarded-for') || '').split(',')[0].trim() ||
      (req.headers?.get?.('x-forwarded-for') || '').split(',')[0].trim() ||
      'unknown';

    const auth = (req.headers.get('authorization') || '');
    const supplied = auth.replace(/^Bearer\s+/i, '').trim();
    if (!TOKEN || !isHex(TOKEN)) {
      return json(new Response(), 500, { ok: false, error: 'Relay not configured (RANKSEO_RELAY_TOKEN missing)' });
    }
    if (!supplied || !safeEqual(TOKEN, supplied)) {
      return json(new Response(), 401, { ok: false, error: 'Invalid or missing bearer token' });
    }
    if (rateLimited(ip)) {
      return json(new Response(), 429, { ok: false, error: 'Too many requests — try again in a minute' });
    }

    const smtp = {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
        : undefined,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000
    };
    if (!smtp.host) {
      return json(new Response(), 500, { ok: false, error: 'Relay not configured (SMTP_HOST missing)' });
    }

    const transporter = nodemailer.createTransport(smtp);

    // Test connection (no email is sent).
    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch (_) {
        return json(new Response(), 400, { ok: false, error: 'Invalid JSON body' });
      }

      if (body && body.test === true) {
        await transporter.verify(); // throws if SMTP is unreachable/bad auth
        return json(new Response(), 200, {
          ok: true,
          test: true,
          smtp: `${smtp.host}:${smtp.port}${smtp.secure ? ' (TLS)' : ''}`
        });
      }

      const to = String(body?.to || '').trim();
      const subject = String(body?.subject || '').trim();
      const bodyText = String(body?.body || '').trim();
      const fileName = String(body?.fileName || 'RankSEO-Audit.pdf')
        .replace(/[^\w.\- ]+/g, '_').slice(0, 120);
      let pdf = String(body?.pdf || '');

      if (!EMAIL_RE.test(to)) {
        return json(new Response(), 400, { ok: false, error: 'Invalid recipient email address' });
      }
      if (!subject) return json(new Response(), 400, { ok: false, error: 'Empty subject' });
      if (subject.length > 300) return json(new Response(), 400, { ok: false, error: 'Subject too long' });
      if (!pdf) return json(new Response(), 400, { ok: false, error: 'Missing PDF attachment' });
      if (pdf.length > MAX_BODY) {
        return json(new Response(), 413, { ok: false, error: 'PDF too large to email' });
      }

      // Accept "data:application/pdf;base64,..." or raw base64.
      const comma = pdf.indexOf(',');
      if (pdf.startsWith('data:') && comma > -1) pdf = pdf.slice(comma + 1);
      const buff = Buffer.from(pdf, 'base64');
      if (!buff.length || buff.length < 40) {
        return json(new Response(), 400, { ok: false, error: 'PDF data is empty or invalid' });
      }
      if (buff.length > 10_000_000) {
        return json(new Response(), 413, { ok: false, error: 'PDF exceeds 10 MB' });
      }

      const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER || 'RankSEO <noreply@localhost>',
        to,
        subject,
        text: bodyText || `RankSEO audit report for ${body?.url || ''}`,
        attachments: [{ filename: fileName, content: buff, contentType: 'application/pdf' }]
      });

      return json(new Response(), 200, {
        ok: true,
        messageId: info.messageId || null,
        smtp: `${smtp.host}:${smtp.port}${smtp.secure ? ' (TLS)' : ''}`
      });
    }

    return json(new Response(), 405, { ok: false, error: 'Method not allowed' });
  } catch (e) {
    const msg = (e && e.message) || 'Relay error';
    const status = /auth|credentials|login/i.test(msg) ? 502 : 500;
    return json(new Response(), status, { ok: false, error: 'SMTP error: ' + msg });
  }
}