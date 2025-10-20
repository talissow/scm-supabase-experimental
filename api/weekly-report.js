// Weekly report serverless function (Vercel)
// Sends a summary email using Resend API without extra packages

/**
 * Environment variables required (configure in Vercel → Project → Settings → Environment Variables):
 * - RESEND_API_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - REPORT_EMAIL_TO (comma-separated emails)
 */

/** @param {import('http').IncomingMessage & { headers: Record<string,string> }} req 
 *  @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    const {
      RESEND_API_KEY,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      REPORT_EMAIL_TO
    } = process.env;

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !REPORT_EMAIL_TO) {
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, error: 'Missing required env vars' }));
      return;
    }

    // Fetch products from Supabase (source of truth)
    const prodResp = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,quantity,min_quantity,unit,cost,type`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!prodResp.ok) throw new Error(`Supabase products error: ${prodResp.status}`);
    const products = await prodResp.json();

    // Movements in the last 7 days (for destination/top outputs)
    const sinceISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const movResp = await fetch(`${SUPABASE_URL}/rest/v1/movements?select=id,product_id,type,quantity,destination,timestamp&timestamp=gte.${sinceISO}`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!movResp.ok) throw new Error(`Supabase movements error: ${movResp.status}`);
    const movements = await movResp.json();

    // KPIs
    const totalMaterials = products.length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= (p.min_quantity ?? 0)).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.cost || 0)), 0);

    // Outputs last 7 days
    const outputs = movements.filter(m => m.type === 'saida');
    const totalOutputs = outputs.length;
    const totalOutputQty = outputs.reduce((s, m) => s + Number(m.quantity || 0), 0);
    const destinations = Array.from(new Set(outputs.map(o => o.destination).filter(Boolean)));

    const currencyBRL = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(n);

    const origin = req.headers?.origin || process.env.PUBLIC_BASE_URL || '';
    const appLink = origin || 'https://vercel.app';

    const html = `
      <div style="font-family: Arial, sans-serif; color:#212529">
        <h2 style="margin:0 0 10px 0">SCM - Relatório Semanal</h2>
        <p style="margin:0 0 16px 0;color:#6c757d">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;min-width:480px">
          <tr>
            <td style="background:#f8f9fa;border:1px solid #dee2e6"><strong>Total de materiais</strong></td>
            <td style="border:1px solid #dee2e6">${totalMaterials}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;border:1px solid #dee2e6"><strong>Estoque baixo</strong></td>
            <td style="border:1px solid #dee2e6">${lowStock}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;border:1px solid #dee2e6"><strong>Esgotados</strong></td>
            <td style="border:1px solid #dee2e6">${outOfStock}</td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;border:1px solid #dee2e6"><strong>Valor total estimado</strong></td>
            <td style="border:1px solid #dee2e6">${currencyBRL(totalValue)}</td>
          </tr>
        </table>
        <h3 style="margin:24px 0 8px 0">Últimos 7 dias (Saídas)</h3>
        <ul style="margin:0 0 16px 18px">
          <li>Total de saídas: <strong>${totalOutputs}</strong></li>
          <li>Quantidade total: <strong>${totalOutputQty}</strong></li>
          <li>Destinos: <strong>${destinations.length}</strong> ${destinations.length ? `(${destinations.join(', ')})` : ''}</li>
        </ul>
        <p style="margin:16px 0">Acesse o sistema para gerar PDFs detalhados pelo menu “Relatórios PDF”:</p>
        <p><a href="${appLink}/SCM_Supabase.html" style="color:#0d6efd">Abrir SCM</a></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e9ecef" />
        <small style="color:#6c757d">Este e-mail foi enviado automaticamente pelo SCM.</small>
      </div>
    `;

    // Send email via Resend REST API
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SCM Reports <reports@scm.talishow.tech>',
        to: REPORT_EMAIL_TO.split(',').map(s => s.trim()).filter(Boolean),
        subject: 'SCM - Relatório Semanal',
        html
      })
    });

    if (!emailResp.ok) {
      const errTxt = await emailResp.text();
      throw new Error(`Resend error: ${emailResp.status} ${errTxt}`);
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  }
}


