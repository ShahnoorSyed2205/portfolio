import { SITE } from "@/lib/site";

export type Lead = {
  topic: string;
  name: string;
  contact: string;
  amount: string;
  currency: string;
  message: string;
  locale: string;
  receivedAt: string;
};

const TOPIC_LABEL: Record<string, string> = {
  "buy-usdt": "Buy USDT",
  "sell-usdt": "Sell USDT",
  property: "Property payment in crypto",
  business: "Crypto for business",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

export function leadEmail(lead: Lead) {
  const topic = TOPIC_LABEL[lead.topic] ?? lead.topic;
  const num = Number(lead.amount.replace(/[,\s]/g, ""));
  const shown = Number.isFinite(num) && lead.amount ? num.toLocaleString("en-US") : lead.amount;
  const amount = lead.amount ? `${lead.currency || "AED"} ${shown}` : "";
  const when = new Date(lead.receivedAt).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const lang = lead.locale === "ar" ? "Arabic" : "English";
  const email = isEmail(lead.contact);
  const digits = lead.contact.replace(/\D/g, "");
  const action = email
    ? { label: "Reply by email", href: `mailto:${lead.contact}?subject=${encodeURIComponent(`Your enquiry to ${SITE.name}`)}` }
    : { label: "Reply on WhatsApp", href: `https://wa.me/${digits}` };

  const subject = ["New enquiry", topic, amount, lead.name].filter(Boolean).join(" · ");

  const text = [
    `NEW ENQUIRY | ${SITE.name}`,
    "",
    `Request:  ${topic}`,
    ...(amount ? [`Amount:   ${amount}`] : []),
    `Name:     ${lead.name}`,
    `Contact:  ${lead.contact}`,
    `Language: ${lang}`,
    `Received: ${when} (Dubai)`,
    "",
    "Message:",
    lead.message || "(none)",
    "",
    `${action.label}: ${action.href}`,
  ].join("\n");

  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 0;width:110px;color:#a3aed0;font-size:13px;vertical-align:top">${k}</td>` +
    `<td style="padding:10px 0;color:#eef3fa;font-size:15px;font-weight:600">${v}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#020326">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020326"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#05073a;border:1px solid #131868;border-radius:16px;font-family:Segoe UI,Helvetica,Arial,sans-serif">
<tr><td style="padding:26px 28px 0">
  <div style="color:#f2ce19;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">New enquiry</div>
  <div style="color:#eef3fa;font-size:24px;line-height:1.25;font-weight:700;margin-top:8px">${esc(topic)}${amount ? ` <span style="color:#3ef3ee">· ${esc(amount)}</span>` : ""}</div>
  <div style="color:#a3aed0;font-size:14px;margin-top:6px">from ${esc(lead.name)} · ${esc(when)} (Dubai)</div>
</td></tr>
<tr><td style="padding:18px 28px 0"><div style="height:2px;background:#f2ce19;width:48px"></div></td></tr>
<tr><td style="padding:10px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${row("Name", esc(lead.name))}
${row("Contact", esc(lead.contact))}
${amount ? row("Amount", esc(amount)) : ""}
${row("Language", lang)}
</table></td></tr>
<tr><td style="padding:14px 28px 0">
  <div style="color:#a3aed0;font-size:13px;margin-bottom:8px">Message</div>
  <div style="background:#020326;border:1px solid #131868;border-radius:10px;padding:14px 16px;color:#eef3fa;font-size:15px;line-height:1.55;white-space:pre-wrap">${lead.message ? esc(lead.message) : '<span style="color:#a3aed0">No message left.</span>'}</div>
</td></tr>
<tr><td style="padding:24px 28px 8px">
  <a href="${esc(action.href)}" style="display:inline-block;background:#f2ce19;color:#020326;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:999px">${action.label}</a>
</td></tr>
<tr><td style="padding:18px 28px 26px;color:#a3aed0;font-size:12px;line-height:1.5">
  Sent from the contact form at <a href="${SITE.url}" style="color:#3ef3ee;text-decoration:none">${SITE.url.replace("https://", "")}</a>. Replying to this email goes to the customer${email ? "" : " only if they left an email address"}.
</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html, replyTo: email ? lead.contact : undefined };
}
