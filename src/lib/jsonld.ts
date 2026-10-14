import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { SITE } from "./site";
import { PAGES, type Slug } from "@/i18n/pages";

export function buildJsonLd(locale: Locale, d: Dict) {
  const url = `${SITE.url}/${locale}`;
  const orgId = `${SITE.url}/#organization`;

  const sameAs = [SITE.instagram];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "FinancialService"],
        "@id": orgId,
        name: SITE.name,
        legalName: "369 LTD",
        url: SITE.url,
        logo: `${SITE.url}/brand/icon-512.png`,
        image: `${SITE.url}/media/og.jpg`,
        slogan: d.footer.tagline,
        alternateName: ["369 LTD Dubai", "369 ليميتد"],
        description: d.meta.description,
        sameAs,
        areaServed: [
          { "@type": "Country", name: "United Arab Emirates" },
          { "@type": "Place", name: "Dubai" },
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.locality,
          addressCountry: SITE.address.country,
          postOfficeBoxNumber: SITE.address.poBox,
        },
        knowsAbout: [
          "USDT trading",
          "Crypto real estate payments",
          "Digital asset trading",
          "AI-assisted market analysis",
          "Crypto payments for business",
        ],
        ...(SITE.email ? { email: SITE.email } : {}),
        ...(SITE.phone ? { telephone: SITE.phone } : {}),
        availableLanguage: ["English", "Arabic"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: locale === "ar" ? "خدمات 369 ليميتد" : "369 LTD services",
          itemListElement: d.services.items.map((item) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: item.title, description: item.text, provider: { "@id": orgId } },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: ["en", "ar"],
        publisher: { "@id": orgId },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: d.meta.title,
        description: d.meta.description,
        inLanguage: locale === "ar" ? "ar-AE" : "en-AE",
        isPartOf: { "@id": `${SITE.url}/#website` },
        about: { "@id": orgId },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: locale === "ar" ? "ar-AE" : "en-AE",
        mainEntity: d.faq.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
}

export function buildPageJsonLd(locale: Locale, slug: Slug, d: Dict) {
  const p = PAGES[locale][slug];
  const url = `${SITE.url}/${locale}/${slug}`;
  const orgId = `${SITE.url}/#organization`;
  const lang = locale === "ar" ? "ar-AE" : "en-AE";
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: p.title,
      description: p.description,
      inLanguage: lang,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": orgId },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "369 LTD", item: `${SITE.url}/${locale}` },
        { "@type": "ListItem", position: 2, name: p.navLabel, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: lang,
      mainEntity: p.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  if (slug !== "about") {
    graph.push({
      "@type": "Service",
      "@id": `${url}#service`,
      name: p.h1,
      description: p.description,
      url,
      inLanguage: lang,
      provider: { "@id": orgId },
      areaServed: [{ "@type": "Country", name: "United Arab Emirates" }, { "@type": "Place", name: "Dubai" }],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
