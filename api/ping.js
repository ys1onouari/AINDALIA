// api/ping.js — Vercel Serverless Function
// KeepAlive endpoint for Supabase Free Tier projects.
// Executes a real PostgREST query against a dedicated keepalive table
// to generate actual database activity and prevent project pausing.
//
// Usage:
//   GET /api/ping
//
// Environment variables:
//   SUPABASE_URL          Required — Supabase project URL
//   SUPABASE_ANON_KEY     Required — Supabase anon/public key
//
// Response (success): 200
//   { ok: true,  service: "supabase", status: "reachable",  httpStatus: 200, latency: 18,  timestamp: "..." }
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

function extractProjectRef(url) {
  try {
    const hostname = new URL(url).hostname;
    const match = hostname.match(/^([^.]+)\.supabase\.co$/);
    return match ? match[1] : undefined;
  } catch {
    return undefined;
  }
}

function buildBody(ok, httpStatus, latency, status, errorMessage) {
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

  return body;
}

function sendJson(res, httpStatus, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  return res.status(httpStatus).json(body);
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
