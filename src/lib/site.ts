export const SITE = {
  name: "369 LTD",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://369-ltd.com").replace(/\/$/, ""),
  instagram: "https://www.instagram.com/dubai_369ltd",
  address: {
    street: "API World Tower, Ground Floor, Office 201, Sheikh Zayed Road",
    locality: "Dubai",
    country: "AE",
    poBox: "414494",
  },
  // Contact channels; env vars override these defaults.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@369-ltd.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+971 58 504 9254",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "+971 58 504 9254",
} as const;
