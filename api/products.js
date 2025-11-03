// Products CRUD via Supabase REST using service role (serverless)
// Only allows a safe subset of fields and relies on DB triggers for updated_at

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

    const baseHeaders = {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    };

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      const limit = Number(url.searchParams.get('limit') || 50);
      const rest = await fetch(`${SUPABASE_URL}/rest/v1/products?select=* &order=created_at.desc&limit=${limit}`, { headers: baseHeaders });
      const data = await rest.json();
      res.statusCode = rest.ok ? 200 : rest.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: rest.ok, products: data }));
      return;
    }

    if (req.method === 'POST') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) || {};
      const payload = {
        name: body.name,
        description: body.description,
        type: body.type,
        quantity: body.quantity,
        min_quantity: body.min_quantity,
        unit: body.unit,
        location: body.location,
        supplier: body.supplier,
        cost: body.cost
      };
      const rest = await fetch(`${SUPABASE_URL}/rest/v1/products`, { method: 'POST', headers: baseHeaders, body: JSON.stringify(payload) });
      const data = await rest.json();
      res.statusCode = rest.ok ? 201 : rest.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: rest.ok, product: Array.isArray(data) ? data[0] : data }));
      return;
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const url = new URL(req.url, 'http://localhost');
      const id = url.searchParams.get('id');
      if (!id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Missing id param' }));
        return;
      }
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) || {};
      const update = {
        name: body.name,
        description: body.description,
        type: body.type,
        quantity: body.quantity,
        min_quantity: body.min_quantity,
        unit: body.unit,
        location: body.location,
        supplier: body.supplier,
        cost: body.cost
      };
      const rest = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'PATCH', headers: baseHeaders, body: JSON.stringify(update) });
      const data = await rest.json();
      res.statusCode = rest.ok ? 200 : rest.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: rest.ok, product: Array.isArray(data) ? data[0] : data }));
      return;
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, 'http://localhost');
      const id = url.searchParams.get('id');
      if (!id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, error: 'Missing id param' }));
        return;
      }
      const rest = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, { method: 'DELETE', headers: baseHeaders });
      res.statusCode = rest.ok ? 200 : rest.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: rest.ok }));
      return;
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
    res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}