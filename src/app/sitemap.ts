import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries([
    ...LOCALES.map((l) => [l, `${SITE.url}/${l}`]),
    ["x-default", `${SITE.url}/en`],
  ]);
  const lastModified = new Date();
  return LOCALES.map((l) => ({
    url: `${SITE.url}/${l}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: l === "en" ? 1 : 0.9,
    alternates: { languages },
  }));
}
