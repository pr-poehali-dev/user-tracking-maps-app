"""
Авторизация: вход по номеру телефона и паролю, выход, получение текущего профиля, список гонщиков (для админа).
Deps: psycopg2-binary
"""
import json
import os
import secrets
from datetime import datetime, timedelta
import psycopg2


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    # Also try to get action from body for POST
    if not action and method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
            action = body.get("action", "")
        except Exception:
            pass

    if action == "login" and method == "POST":
        return login(event)
    if action == "logout" and method == "POST":
        return logout(event)
    if action == "me" and method == "GET":
        return me(event)
    if action == "racers" and method == "GET":
        return get_racers(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    phone = (body.get("phone") or "").strip()
    pwd = (body.get("pwd") or "").strip()

    if not phone or not pwd:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите телефон и пароль"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, account_type, initials FROM racers WHERE phone = %s AND pwd = %s",
        (phone, pwd)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный телефон или пароль"})}

    user_id, name, account_type, initials = row
    session_id = secrets.token_hex(32)
    expires = datetime.now() + timedelta(days=30)
    cur.execute(
        "INSERT INTO auth_sessions (id, racer_id, created_at, expires_at) VALUES (%s, %s, %s, %s)",
        (session_id, user_id, datetime.now(), expires)
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "session_id": session_id,
            "user": {"id": user_id, "name": name, "account_type": account_type, "initials": initials}
        })
    }


def logout(event: dict) -> dict:
    session_id = event.get("headers", {}).get("X-Session-Id", "")
    if session_id:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE auth_sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
        conn.commit()
        conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}


def me(event: dict) -> dict:
    session_id = event.get("headers", {}).get("X-Session-Id", "")
    if not session_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT r.id, r.name, r.account_type, r.initials
           FROM auth_sessions s JOIN racers r ON r.id = s.racer_id
           WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id, name, account_type, initials = row
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"id": user_id, "name": name, "account_type": account_type, "initials": initials})
    }


def get_racers(event: dict) -> dict:
    session_id = event.get("headers", {}).get("X-Session-Id", "")
    if not session_id:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()

    # Check admin
    cur.execute(
        """SELECT r.account_type FROM auth_sessions s JOIN racers r ON r.id = s.racer_id
           WHERE s.id = %s AND s.expires_at > NOW()""",
        (session_id,)
    )
    row = cur.fetchone()
    if not row or row[0] != "admin":
        conn.close()
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    cur.execute("SELECT id, name, account_type, initials, phone FROM racers WHERE account_type = 'racer' ORDER BY name")
    racers = [{"id": r[0], "name": r[1], "account_type": r[2], "initials": r[3], "phone": r[4]} for r in cur.fetchall()]
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"racers": racers})}