import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isLocale } from "@/i18n/config";
import { PAGES, SLUGS, isSlug } from "@/i18n/pages";
import { getDict } from "@/lib/dictionaries";
import { buildPageJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ServicePage } from "@/components/ServicePage";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => SLUGS.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isSlug(slug)) return {};
  const p = PAGES[lang][slug];
  const url = `${SITE.url}/${lang}/${slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: {
      canonical: url,
      languages: { en: `${SITE.url}/en/${slug}`, ar: `${SITE.url}/ar/${slug}`, "x-default": `${SITE.url}/en/${slug}` },
    },
    openGraph: { type: "website", url, title: p.title, description: p.description, locale: lang === "ar" ? "ar_AE" : "en_AE", siteName: SITE.name, images: [{ url: "/media/og.jpg", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: p.title, description: p.description, images: ["/media/og.jpg"] },
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isSlug(slug)) notFound();
  const d = getDict(lang);
  const base = `/${lang}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPageJsonLd(lang, slug, d)).replace(/</g, "\\u003c") }}
      />
      <Nav locale={lang} d={d} base={base} />
      <main id="main" className="overflow-x-clip">
        <ServicePage d={d} locale={lang} slug={slug} />
        <Contact d={d} locale={lang} defaultTopic={PAGES[lang][slug].topic} channels={{ email: SITE.email, phone: SITE.phone, whatsapp: SITE.whatsapp, instagram: SITE.instagram }} />
      </main>
      <Footer d={d} locale={lang} base={base} />
    </>
  );
}
