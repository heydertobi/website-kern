import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { type DankeSchutz } from "./danke.js";
/**
 * Proxy jeder Kunden-Website (Next 16, proxy.ts im Projektwurzel):
 *
 *   import { kernProxy } from "@dertobi/website-kern/proxy";
 *   import { danke } from "@/lib/danke";
 *   export function proxy(request: NextRequest, event: NextFetchEvent) {
 *     return kernProxy(request, event, { danke });
 *   }
 *   export const config = { matcher: [ …KERN_MATCHER wörtlich… ] };
 *
 * Next liest `config.matcher` statisch aus der Datei, deshalb muss die Liste
 * dort wörtlich stehen (siehe proxy.ts der Website-Vorlage).
 *
 * Reihenfolge: Scanner-Pfade (leere 404, keine Messung), Danke-Schutz,
 * serverseitige Matomo-Meldung nach der Antwort (verzögert die Seite nicht).
 */
export declare function kernProxy(request: NextRequest, event: NextFetchEvent, { danke, weiter, zaehlen, }?: {
    danke?: DankeSchutz;
    weiter?: (request: NextRequest) => NextResponse | null;
    /** Eigene Zählregel der Website, z. B. nur bekannte Seiten. Ohne: alles, was der Kern zählt. */
    zaehlen?: (url: string) => boolean;
}): NextResponse;
/** Zum Abgleich: diese Liste steht wörtlich in `config.matcher` der proxy.ts. */
export declare const KERN_MATCHER: readonly ["/((?!api/|_next/|_vercel/|webhook/|.*\\.[a-zA-Z0-9]+$).*)", "/((?:.*/)?\\.(?!well-known).*)", "/(.*\\.php.*)"];
