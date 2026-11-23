import type { MetadataRoute } from "next";

/** KI-Crawler mit eigenem Block, damit „User-agent: GPTBot“ + „Allow: /“ wörtlich in robots.txt steht. */
export const KI_CRAWLER = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"] as const;

/**
 * robots.txt jeder Kunden-Website (app/robots.ts):
 *   export default () => kernRobots({ domain: SITE.domain, indexierungFrei: INDEXIERUNG_FREI });
 *
 * Vor der Freigabe ist alles gesperrt (eine indexierte Testdomain steht sonst
 * als Doppelgänger neben der Altseite). Danach wird KEINE Seite über
 * robots.txt gesperrt: Seiten mit noindex tragen das selbst, und Google muss
 * es lesen können. Gesperrt bleibt nur, was nie HTML ist (Standard: /api/).
 */
export function kernRobots({
  domain,
  indexierungFrei,
  gesperrt = ["/api/"],
}: {
  domain: string;
  indexierungFrei: boolean;
  gesperrt?: string[];
}): MetadataRoute.Robots {
  if (!indexierungFrei) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: gesperrt },
      ...KI_CRAWLER.map((userAgent) => ({ userAgent, allow: "/", disallow: gesperrt })),
    ],
    sitemap: `${domain.replace(/\/$/, "")}/sitemap.xml`,
  };
}
