import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/libre-franklin/800.css";
import "@fontsource-variable/montserrat/index.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/600.css";
import "@fontsource/noto-sans-arabic/800.css";
import "../globals.css";
import { LOCALES, dirOf, isLocale, type Locale } from "@/i18n/config";
import { getDict } from "@/lib/dictionaries";
import { SITE } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#020326",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  const canonical = `${SITE.url}/${lang}`;

  return {
    metadataBase: new URL(SITE.url),
    title: d.meta.title,
    description: d.meta.description,
    keywords: [...d.meta.keywords],
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    alternates: {
      canonical,
      languages: { en: `${SITE.url}/en`, ar: `${SITE.url}/ar`, "x-default": `${SITE.url}/en` },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: canonical,
      title: d.meta.title,
      description: d.meta.description,
      locale: lang === "ar" ? "ar_AE" : "en_AE",
      alternateLocale: lang === "ar" ? ["en_AE"] : ["ar_AE"],
      images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: d.meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: d.meta.title,
      description: d.meta.description,
      images: ["/media/og.jpg"],
    },
    icons: {
      icon: [
        { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/brand/apple-touch-icon.png",
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    formatDetection: { telephone: false },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const d = getDict(locale);

  return (
    <html lang={locale === "ar" ? "ar-AE" : "en"} dir={dirOf(locale)}>
      <body>
        <noscript>
          <style>{`[style*="opacity: 0"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="fixed start-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink focus:translate-y-0"
        >
          {d.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
