// List users using Supabase Auth Admin API (requires service role)
// Paginates results to avoid large payloads

/**
 * Required env vars:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

/** @param {import('http').IncomingMessage & { url: string, method: string }} req 
 *  @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }));
      return;
    }

    // Parse query params for pagination
    const url = new URL(req.url, 'http://localhost');
    const page = Number(url.searchParams.get('page') || 1);
    const perPage = Number(url.searchParams.get('perPage') || 50);

    const apiUrl = `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const resp = await fetch(apiUrl, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    if (!resp.ok) {
      const errText = await resp.text();
      res.statusCode = resp.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: `Auth admin error: ${resp.status} ${errText}` }));
      return;
    }

    const users = await resp.json();
    // Map minimal fields for safety
    const data = Array.isArray(users) ? users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at })) : users;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, page, perPage, count: Array.isArray(data) ? data.length : undefined, users: data }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}