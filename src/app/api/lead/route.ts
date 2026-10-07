import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOPICS = ["buy-usdt", "sell-usdt", "property", "business"] as const;
const CURRENCIES = ["AED", "USD", "EUR", "GBP"] as const;

// Best-effort limiter. Replace with a shared store (Upstash, Vercel KV) if traffic grows.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields, humans do not. Pretend success.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true });

  const topic = clean(body.topic, 20);
  const name = clean(body.name, 120);
  const contact = clean(body.contact, 160);
  const message = clean(body.message, 2000);
  const amount = clean(body.amount, 24);
  const currency = clean(body.currency, 3);
  const locale = clean(body.locale, 2) === "ar" ? "ar" : "en";

  const errors: Record<string, string> = {};
  if (!(TOPICS as readonly string[]).includes(topic)) errors.topic = "invalid";
  if (name.length < 2) errors.name = "required";
  if (!EMAIL.test(contact) && !PHONE.test(contact)) errors.contact = "invalid";
  if (amount && !/^[0-9][0-9,.\s]{0,18}$/.test(amount)) errors.amount = "invalid";
  if (currency && !(CURRENCIES as readonly string[]).includes(currency)) errors.currency = "invalid";
  if (body.consent !== true) errors.consent = "required";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const lead = { topic, name, contact, amount, currency, message, locale, receivedAt: new Date().toISOString() };

  // Deliver to any webhook (Make, Zapier, Slack, CRM). Without one the lead is only logged.
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "369ltd.com", ...lead }),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (err) {
      console.error("[lead] webhook delivery failed", err);
      return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
    }
  } else {
    console.warn("[lead] LEAD_WEBHOOK_URL not set, lead was not delivered anywhere", lead.topic, lead.receivedAt);
  }

  return NextResponse.json({ ok: true });
}
