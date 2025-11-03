// Database diagnostic endpoint: summarizes schema accessibility, counts, samples, and users
// Uses Supabase REST and Auth Admin endpoints with service role from env

/**
 * Required env vars:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

/** @param {import('http').IncomingMessage & { method: string, url: string }} req 
 *  @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }));
      return;
    }

    const headers = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'count=exact'
    };

    async function tableSummary(table, sampleSelect) {
      const countResp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, { headers });
      const range = countResp.headers.get('content-range');
      const count = range && range.includes('/') ? Number(range.split('/')[1]) : null;
      const ok = countResp.ok;

      let sample = [];
      if (ok) {
        const sampleResp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(sampleSelect)}&order=created_at.desc&limit=5`, { headers });
        sample = sampleResp.ok ? await sampleResp.json() : [];
      }

      return { ok, count, sample };
    }

    // Summaries for main tables
    const products = await tableSummary('products', 'id,name,quantity,min_quantity,unit,type,created_at,updated_at');
    const movements = await tableSummary('movements', 'id,product_id,type,quantity,destination,reason,created_at');
    const custom_types = await tableSummary('custom_types', 'id,name,description,created_at');
    const audit_log = await tableSummary('audit_log', 'id,user_email,action,table_name,record_id,created_at');
    // public.users may or may not exist depending on schema
    const usersPublic = await tableSummary('users', 'id,email,full_name,role,is_active,created_at,updated_at').catch(() => ({ ok: false }));

    // Auth users via Admin API
    const authResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, { headers });
    let authUsers = [];
    if (authResp.ok) {
      const raw = await authResp.json();
      authUsers = Array.isArray(raw) ? raw.map(u => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at })) : [];
    }

    const report = {
      ok: true,
      timestamp: new Date().toISOString(),
      project: SUPABASE_URL,
      tables: {
        products,
        movements,
        custom_types,
        audit_log,
        users_public: usersPublic
      },
      users: {
        auth_count: authUsers.length,
        auth_sample: authUsers.slice(0, 10)
      }
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(report));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}