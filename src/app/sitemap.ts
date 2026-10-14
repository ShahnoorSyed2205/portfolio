import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { SLUGS } from "@/i18n/pages";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = ["", ...SLUGS.map((s) => `/${s}`)];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries([
      ...LOCALES.map((l) => [l, `${SITE.url}/${l}${path}`]),
      ["x-default", `${SITE.url}/en${path}`],
    ]);
    return LOCALES.map((l) => ({
      url: `${SITE.url}/${l}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? (l === "en" ? 1 : 0.9) : 0.8,
      alternates: { languages },
    }));
  });
}
