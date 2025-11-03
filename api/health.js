// Health check endpoint for Supabase connectivity (Vercel serverless style)
// Reads env vars and performs lightweight requests to confirm availability

/**
 * Required env vars:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

/** @param {import('http').IncomingMessage & { headers: Record<string,string> }} req 
 *  @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }));
      return;
    }

    // Simple head-like select to test REST access
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    const status = resp.ok ? 'ok' : 'error';
    const details = resp.ok ? undefined : await resp.text();

    res.statusCode = resp.ok ? 200 : 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: resp.ok, status, details }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}