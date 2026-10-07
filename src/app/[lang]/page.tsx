import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/lib/dictionaries";
import { buildJsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";
import { Flow } from "@/components/Flow";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Office } from "@/components/Office";
import { Services } from "@/components/Services";
import { Values } from "@/components/Values";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(lang, d)).replace(/</g, "\\u003c") }}
      />
      <Nav locale={lang} d={d} />
      <main id="main" className="overflow-x-clip">
        <Hero d={d} />
        <Marquee items={d.marquee} />
        <About d={d} />
        <Services d={d} />
        <Flow d={d} />
        <Office d={d} lang={lang} />
        <Values d={d} />
        <Faq d={d} />
        <Contact
          d={d}
          locale={lang}
          channels={{ email: SITE.email, phone: SITE.phone, whatsapp: SITE.whatsapp, instagram: SITE.instagram }}
        />
      </main>
      <Footer d={d} locale={lang} />
    </>
  );
}
