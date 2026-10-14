import type { Locale } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { SITE } from "./site";

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
