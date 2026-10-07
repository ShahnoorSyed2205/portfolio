"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle,
  EnvelopeSimple,
  InstagramLogo,
  MapPin,
  Phone,
  WhatsappLogo,
} from "@phosphor-icons/react";
import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { TOPIC_EVENT } from "./TopicLink";

type Channels = { email?: string; phone?: string; whatsapp?: string; instagram: string };
type Errors = Partial<Record<"name" | "contact" | "consent", string>>;
type Status = "idle" | "sending" | "success" | "error";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s().-]{7,20}$/;

const field =
  "w-full rounded-[14px] border border-white/30 bg-ink-900 px-4 py-3.5 text-base text-fg placeholder:text-muted/80 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 aria-[invalid=true]:border-[#ff8a8a]";

export function Contact({ d, locale, channels }: { d: Dict; locale: Locale; channels: Channels }) {
  const c = d.contact;
  const [topic, setTopic] = useState(c.topics[0].value);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const onTopic = (e: Event) => {
      const v = (e as CustomEvent<string>).detail;
      if (c.topics.some((t) => t.value === v)) setTopic(v);
    };
    window.addEventListener(TOPIC_EVENT, onTopic);
    return () => window.removeEventListener(TOPIC_EVENT, onTopic);
  }, [c.topics]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const consent = form.get("consent") === "on";

    const next: Errors = {};
    if (name.length < 2) next.name = c.required;
    if (!contact) next.contact = c.required;
    else if (!EMAIL.test(contact) && !PHONE.test(contact)) next.contact = c.invalidContact;
    if (!consent) next.consent = c.consentRequired;
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name,
          contact,
          amount: String(form.get("amount") ?? ""),
          currency: String(form.get("currency") ?? ""),
          message: String(form.get("message") ?? ""),
          company: String(form.get("company") ?? ""),
          consent,
          locale,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const rows = [
    channels.email && { icon: EnvelopeSimple, label: c.email, text: channels.email, href: `mailto:${channels.email}` },
    channels.phone && { icon: Phone, label: c.phone, text: channels.phone, href: `tel:${channels.phone.replace(/\s/g, "")}` },
    channels.whatsapp && {
      icon: WhatsappLogo,
      label: c.whatsapp,
      text: channels.whatsapp,
      href: `https://wa.me/${channels.whatsapp.replace(/\D/g, "")}`,
    },
    { icon: InstagramLogo, label: c.instagram, text: "@dubai_369ltd", href: channels.instagram },
  ].filter(Boolean) as { icon: typeof Phone; label: string; text: string; href: string }[];

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-16 md:py-24">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_bottom,rgb(62_243_238/0.14),transparent_70%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="contact-title" className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.025em] md:text-6xl [html[lang=ar]_&]:leading-[1.3] [html[lang=ar]_&]:tracking-normal">
            {c.title}
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">{c.intro}</p>

          <address className="mt-10 flex flex-col gap-5 not-italic">
            <div className="flex items-start gap-4">
              <MapPin size={24} weight="duotone" className="mt-1 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-muted">{c.addressLabel}</p>
                <p className="mt-1">{c.addressValue}</p>
                <p className="text-muted">{c.poBox}</p>
              </div>
            </div>
            {rows.map(({ icon: Icon, label, text, href }) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-start gap-4 transition hover:text-accent">
                <Icon size={24} weight="duotone" className="mt-1 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-muted">{label}</p>
                  <p className="mt-1" dir="ltr">{text}</p>
                </div>
              </a>
            ))}
          </address>
        </div>

        <div className="panel p-6 md:p-10">
          {status === "success" ? (
            <div role="status" className="flex min-h-[22rem] flex-col items-center justify-center gap-4 text-center">
              <CheckCircle size={56} weight="duotone" className="text-accent" />
              <p className="max-w-xs font-display text-2xl font-extrabold">{c.success}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-muted">{c.topicLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {c.topics.map((t) => (
                    <label key={t.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="topic"
                        value={t.value}
                        checked={topic === t.value}
                        onChange={() => setTopic(t.value)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink-900 hover:border-accent">
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
                <div className="grid gap-2">
                  <label htmlFor="amount" className="text-sm font-semibold text-muted">{c.amountLabel}</label>
                  <input id="amount" name="amount" inputMode="decimal" autoComplete="off" placeholder="50,000" className={field} dir="ltr" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="currency" className="text-sm font-semibold text-muted">{c.currencyLabel}</label>
                  <select id="currency" name="currency" defaultValue="AED" className={field}>
                    {["AED", "USD", "EUR", "GBP"].map((cur) => (
                      <option key={cur} value={cur}>{cur}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-muted">{c.nameLabel}</label>
                  <input id="name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} className={field} />
                  {errors.name && <p id="name-err" className="text-sm text-[#ffb0b0]">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contact" className="text-sm font-semibold text-muted">{c.contactLabel}</label>
                  <input id="contact" name="contact" autoComplete="email" aria-invalid={!!errors.contact} aria-describedby={errors.contact ? "contact-err" : undefined} className={field} dir="ltr" />
                  {errors.contact && <p id="contact-err" className="text-sm text-[#ffb0b0]">{errors.contact}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-semibold text-muted">{c.messageLabel}</label>
                <textarea id="message" name="message" rows={4} maxLength={2000} className={field} />
              </div>

              {/* Honeypot, hidden from people and assistive tech. */}
              <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Company
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="grid gap-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input type="checkbox" name="consent" className="peer sr-only" aria-invalid={!!errors.consent} />
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 border-white/50 bg-ink-900 text-transparent transition peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink-900"
                  >
                    <Check size={16} weight="bold" />
                  </span>
                  <span>{c.consent}</span>
                </label>
                {errors.consent && <p className="text-sm text-[#ffb0b0]">{errors.consent}</p>}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-accent px-10 text-base font-semibold text-accent-ink transition active:scale-[0.98] hover:brightness-110 disabled:opacity-70"
                >
                  {status === "sending" ? c.sending : c.submit}
                </button>
                {status === "error" && (
                  <p role="alert" className="text-sm text-[#ffb0b0]">{c.error}</p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
