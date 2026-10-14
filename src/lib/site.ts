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
  // Contact channels are only shown when configured. Confirm with the client before setting.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@369-ltd.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP,
} as const;
