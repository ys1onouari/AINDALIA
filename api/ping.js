// api/ping.js — Vercel Serverless Function
// KeepAlive endpoint for Supabase Free Tier projects.
// Executes a real PostgREST query against a dedicated keepalive table
// to generate actual database activity and prevent project pausing.
// Detects HTTP 540 (project paused) and attempts automatic restore via
// Supabase Management API when authorized via X-KeepAlive-Secret header.
//
// Usage:
//   GET /api/ping                           — health check (public)
//   GET /api/ping + X-KeepAlive-Secret      — health check + auto-restore
//
// Environment variables:
//   SUPABASE_URL          Required — Supabase project URL
//   SUPABASE_ANON_KEY     Required — Supabase anon/public key
//   SUPABASE_SBP          Required for restore — Supabase Personal Access Token
//   KEEPALIVE_SECRET      Required for restore — shared secret (GAS ↔ Vercel)
//
// Response (success): 200
//   { ok: true,  service: "supabase", status: "reachable",  httpStatus: 200, latency: 18,  timestamp: "..." }
//
// Response (paused + not authorized): 503
//   { ok: false, service: "supabase", status: "paused", restore: "not_authorized", ... }
//
// Response (restore requested): 503
//   { ok: false, service: "supabase", status: "restore_requested", restore: "requested", ... }
//
// Response (restore failed): 503
//   { ok: false, service: "supabase", status: "restore_failed", restore: "rate_limited|failed|project_ref_missing", ... }
//
// Response (timeout): 503
//   { ok: false, service: "supabase", status: "timeout",    httpStatus: 503, latency: 10000, timestamp: "...", error: "..." }
//
// Response (error): 503
//   { ok: false, service: "supabase", status: "unreachable", httpStatus: 503, latency: 250,  timestamp: "...", error: "..." }
//
// Response (bad method): 405
//   { ok: false, service: "supabase", status: "unreachable", httpStatus: 405, latency: 0,    timestamp: "...", error: "..." }

const SUPABASE_QUERY_PATH = '/rest/v1/keepalive?select=id&limit=1';
const REQUEST_TIMEOUT_MS = 10000;
const MANAGEMENT_API_TIMEOUT_MS = 5000;
const MANAGEMENT_API_BASE = 'https://api.supabase.com';

function extractProjectRef(url) {
  try {
    const hostname = new URL(url).hostname;
    const match = hostname.match(/^([^.]+)\.supabase\.co$/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

function buildBody(ok, httpStatus, latency, status, errorMessage, restore) {
  const body = {
    ok,
    service: 'supabase',
    status,
    httpStatus,
    latency,
    timestamp: new Date().toISOString()
  };

  const projectRef = extractProjectRef(process.env.SUPABASE_URL || '');
  if (projectRef) {
    body.project = projectRef;
  }

  if (errorMessage) {
    body.error = errorMessage;
  }

  if (restore) {
    body.restore = restore;
  }

  return body;
}

function sendJson(res, httpStatus, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  return res.status(httpStatus).json(body);
}

async function restoreProject(projectRef) {
  const managementToken = process.env.SUPABASE_SBP;
  if (!managementToken) {
    console.warn('[api/ping] Management API token (SUPABASE_SBP) not configured');
    return 'failed';
  }

  const url = `${MANAGEMENT_API_BASE}/v1/projects/${projectRef}/restore`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MANAGEMENT_API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${managementToken}`
      }
    });

    clearTimeout(timeoutId);

    if (response.status === 200) {
      return 'requested';
    }
    if (response.status === 429) {
      console.warn('[api/ping] Management API rate limited — HTTP 429');
      return 'rate_limited';
    }
    console.warn(`[api/ping] Management API returned HTTP ${response.status}`);
    return 'failed';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('[api/ping] Management API timeout');
      return 'failed';
    }
    console.warn('[api/ping] Management API error');
    return 'failed';
  }
}

export default async function handler(req, res) {
  const start = Date.now();

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    console.warn(`[api/ping] Rejected ${req.method} — method not allowed`);
    return sendJson(
      res, 405,
      buildBody(false, 405, 0, 'unreachable', `Method ${req.method} not allowed`)
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const elapsed = Date.now() - start;
    console.error('[api/ping] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return sendJson(
      res, 500,
      buildBody(false, 500, elapsed, 'unreachable', 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables')
    );
  }

  const queryUrl = `${supabaseUrl}${SUPABASE_QUERY_PATH}`;

  console.log(`[api/ping] Starting — GET ${SUPABASE_QUERY_PATH}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(queryUrl, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });

    clearTimeout(timeoutId);

    const latency = Date.now() - start;

    if (response.ok) {
      console.log(`[api/ping] Completed — ${response.status} in ${latency}ms`);
      return sendJson(res, 200, buildBody(true, response.status, latency, 'reachable'));
    }

    if (response.status === 540) {
      console.warn(`[api/ping] Project paused — HTTP 540 in ${latency}ms`);

      const keepAliveSecret = process.env.KEEPALIVE_SECRET;
      const incomingSecret = req.headers['x-keepalive-secret'];

      if (!keepAliveSecret || !incomingSecret || incomingSecret !== keepAliveSecret) {
        console.warn('[api/ping] Restore not authorized');
        return sendJson(
          res, 503,
          buildBody(false, 503, latency, 'paused', undefined, 'not_authorized')
        );
      }

      const projectRef = extractProjectRef(supabaseUrl);
      if (!projectRef) {
        console.warn('[api/ping] Cannot restore — project_ref_missing');
        return sendJson(
          res, 503,
          buildBody(false, 503, latency, 'restore_failed', undefined, 'project_ref_missing')
        );
      }

      console.log('[api/ping] Attempting restore...');
      const restoreResult = await restoreProject(projectRef);

      const restoreStatus = restoreResult === 'requested' ? 'restore_requested' : 'restore_failed';
      console.log(`[api/ping] Restore result — ${restoreResult}`);

      return sendJson(
        res, 503,
        buildBody(false, 503, latency, restoreStatus, undefined, restoreResult)
      );
    }

    console.warn(`[api/ping] Failed — HTTP ${response.status} in ${latency}ms`);
    return sendJson(
      res, 503,
      buildBody(false, 503, latency, 'unreachable', `Supabase returned HTTP ${response.status}`)
    );
  } catch (error) {
    const latency = Date.now() - start;

    if (error.name === 'AbortError') {
      console.warn(`[api/ping] Timeout — ${REQUEST_TIMEOUT_MS}ms exceeded`);
      return sendJson(
        res, 503,
        buildBody(false, 503, latency, 'timeout', `Request timed out after ${REQUEST_TIMEOUT_MS}ms`)
      );
    }

    console.error(`[api/ping] Error — ${error.message} in ${latency}ms`);
    return sendJson(
      res, 503,
      buildBody(false, 503, latency, 'unreachable', error.message || 'Request to Supabase failed')
    );
  }
}
