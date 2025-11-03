import os
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, urlencode
from urllib.request import Request, urlopen

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

REST_BASE = f"{SUPABASE_URL}/rest/v1"
AUTH_BASE = f"{SUPABASE_URL}/auth/v1"

def make_headers(content_json=True):
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Prefer": "count=exact",
    }
    if content_json:
        headers["Content-Type"] = "application/json"
    return headers

def http_json(method, url, params=None, body=None, extra_headers=None):
    if params:
        query = urlencode(params, doseq=True)
        url = f"{url}?{query}"
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    headers = make_headers()
    if extra_headers:
        headers.update(extra_headers)
    req = Request(url, data=data, headers=headers, method=method)
    try:
        with urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            text = content.strip() or "null"
            parsed = json.loads(text)
            # Retorna headers em forma case-insensitive (HTTPMessage)
            return parsed, resp.getcode(), resp.headers
    except Exception as e:
        return {"error": str(e), "url": url}, 500, {}

def rest_count_table(table):
    url = f"{REST_BASE}/{table}"
    params = {"select": "id", "limit": 1}
    parsed, code, headers = http_json(
        "GET", url,
        params=params,
        extra_headers={"Range": "0-0", "Range-Unit": "items"}
    )
    if 200 <= code < 300:
        cr = headers.get("Content-Range") or headers.get("content-range")
        if cr and "/" in cr:
            try:
                return int(cr.split("/")[-1])
            except:
                pass
        # Fallback: tenta contar até 1000 registros
        parsed2, code2, headers2 = http_json(
            "GET", url,
            params={"select": "id", "limit": 1000},
            extra_headers={"Range": "0-999", "Range-Unit": "items"}
        )
        if 200 <= code2 < 300 and isinstance(parsed2, list):
            return len(parsed2)
    return None

def rest_sample(table, order_fields=("updated_at", "id"), limit=5):
    base_url = f"{REST_BASE}/{table}"
    for field in order_fields:
        parsed, code, _ = http_json("GET", base_url, params={"order": f"{field}.desc", "limit": limit})
        if code >= 200 and code < 300 and isinstance(parsed, list):
            return parsed
    parsed, code, _ = http_json("GET", base_url, params={"limit": limit})
    return parsed if code >= 200 and code < 300 else []

def detect_authorship_column(table, candidates=("created_by", "owner_id", "user_id", "user_email")):
    base_url = f"{REST_BASE}/{table}"
    for col in candidates:
        parsed, code, _ = http_json("GET", base_url, params={"select": col, "limit": 1})
        if code >= 200 and code < 300:
            return col
    return None

def rest_group_counts(table, group_col, limit=10):
    base_url = f"{REST_BASE}/{table}"
    params = {"select": f"{group_col},count:id", "group": group_col, "order": "count.desc", "limit": limit}
    parsed, code, _ = http_json("GET", base_url, params=params)
    if code >= 200 and code < 300 and isinstance(parsed, list):
        result = {}
        for row in parsed:
            key = row.get(group_col)
            cnt = row.get("count") or row.get("count:id")
            result[str(key)] = int(cnt) if cnt is not None else 0
        return result
    return {}

def auth_users_sample(limit=10):
    url = f"{AUTH_BASE}/admin/users"
    parsed, code, _ = http_json("GET", url, params={"limit": limit})
    if code >= 200 and code < 300:
        users = []
        if isinstance(parsed, list):
            users = parsed
        elif isinstance(parsed, dict) and "users" in parsed:
            users = parsed["users"]
        sample = []
        for u in users[:limit]:
            sample.append({
                "id": u.get("id"),
                "email": u.get("email"),
                "created_at": u.get("created_at") or u.get("created"),
                "last_sign_in_at": u.get("last_sign_in_at"),
            })
        return {"count": len(users), "sample": sample}
    return {"count": None, "sample": [], "error": parsed.get("error") if isinstance(parsed, dict) else "auth error"}

class Handler(BaseHTTPRequestHandler):
    def _json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/db-diagnostic":
            self.handle_db_diagnostic()
        elif path == "/api/user-content-report":
            self.handle_user_report()
        else:
            self._json({"error": "not found", "path": path}, status=404)

    def _require_env(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            return False, {"ok": False, "error": "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"}
        return True, None

    def handle_db_diagnostic(self):
        ok, err = self._require_env()
        if not ok:
            self._json(err, status=400)
            return

        tables = ["products", "movements", "custom_types", "audit_log"]
        result = {"ok": True, "tables": {}, "users": {}}

        for t in tables:
            count = rest_count_table(t)
            sample = rest_sample(t)
            result["tables"][t] = {
                "ok": count is not None,
                "count": count,
                "sample": sample if isinstance(sample, list) else [],
            }

        pu_count = rest_count_table("users")
        if pu_count is not None:
            pu_sample = rest_sample("users")
            result["tables"]["users_public"] = {
                "ok": True,
                "count": pu_count,
                "sample": pu_sample if isinstance(pu_sample, list) else [],
            }

        result["users"] = auth_users_sample(limit=10)
        self._json(result, status=200)

    def handle_user_report(self):
        ok, err = self._require_env()
        if not ok:
            self._json(err, status=400)
            return

        tables = ["products", "movements", "audit_log", "users"]
        report = {"ok": True, "tables": {}, "users": auth_users_sample(limit=10)}

        for t in tables:
            col = detect_authorship_column(t)
            table_info = {"authorship_column": col, "counts": {}, "sample": []}
            if col:
                table_info["counts"] = rest_group_counts(t, col, limit=10)
                if table_info["counts"]:
                    top_user = sorted(table_info["counts"].items(), key=lambda kv: kv[1], reverse=True)[0][0]
                    if top_user != "None":
                        params = {"limit": 5, "order": "updated_at.desc"}
                        parsed, code, _ = http_json("GET", f"{REST_BASE}/{t}", params={**params, col: f"eq.{top_user}"})
                        if code >= 200 and code < 300 and isinstance(parsed, list):
                            table_info["sample"] = parsed
                        else:
                            parsed, code, _ = http_json("GET", f"{REST_BASE}/{t}", params={"limit": 5, col: f"eq.{top_user}"})
                            if code >= 200 and code < 300 and isinstance(parsed, list):
                                table_info["sample"] = parsed
            else:
                cnt = rest_count_table(t)
                table_info["counts"] = {"total": cnt} if cnt is not None else {}
                table_info["sample"] = rest_sample(t)

            report["tables"][t] = table_info

        self._json(report, status=200)

def run(port=3000):
    server = HTTPServer(("127.0.0.1", port), Handler)
    print(f"Python API Server running at http://127.0.0.1:{port}")
    print("Endpoints: /api/db-diagnostic, /api/user-content-report")
    server.serve_forever()

if __name__ == "__main__":
    run()