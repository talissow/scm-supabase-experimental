// Aggregated report of users and their content across tables
// Tries common ownership columns: created_by, owner_id, user_id, user_email

/** @param {import('http').IncomingMessage} req 
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

    async function groupCounts(table, column) {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=${column},count:id&group=${column}`;
      const resp = await fetch(url, { headers });
      if (!resp.ok) return null;
      const rows = await resp.json();
      if (!Array.isArray(rows) || rows.length === 0) return null;
      const map = {};
      for (const r of rows) {
        const key = r[column];
        const c = typeof r.count === 'number' ? r.count : Number(r.count);
        if (key !== null && key !== undefined) map[String(key)] = c;
      }
      return map;
    }

    async function sampleBy(table, column, value) {
      const enc = encodeURIComponent(`${column}.eq.${value}`);
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${enc}&order=created_at.desc&limit=5`, { headers });
      if (!resp.ok) return [];
      return resp.json();
    }

    // Fetch auth users to help map ids/emails
    const authResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, { headers });
    const authUsers = authResp.ok ? await authResp.json() : [];
    const usersIndexById = new Map();
    const usersIndexByEmail = new Map();
    for (const u of authUsers || []) {
      if (u.id) usersIndexById.set(String(u.id), u);
      if (u.email) usersIndexByEmail.set(String(u.email), u);
    }

    const tables = ['products', 'movements', 'audit_log', 'users'];
    const candidateColumns = ['created_by', 'owner_id', 'user_id', 'user_email'];
    const results = {};

    for (const t of tables) {
      const byColumn = {};
      for (const col of candidateColumns) {
        const grouped = await groupCounts(t, col); // may be null if column doesn't exist
        if (grouped && Object.keys(grouped).length) {
          byColumn[col] = { counts: grouped };
          // Attach samples for top 1 key
          const topKey = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0];
          if (topKey) {
            byColumn[col].sample = await sampleBy(t, col, topKey);
          }
        }
      }
      results[t] = byColumn;
    }

    const response = {
      ok: true,
      generated_at: new Date().toISOString(),
      users_total: Array.isArray(authUsers) ? authUsers.length : null,
      users_sample: Array.isArray(authUsers) ? authUsers.slice(0, 10).map(u => ({ id: u.id, email: u.email, created_at: u.created_at })) : [],
      content_by_table: results
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}