import { NextResponse } from "next/server";
import { MATOMO_OPT_OUT_COOKIE, matomoKonfig, seitenaufrufMelden, sollGezaehltWerden } from "./matomo.js";
import { istScannerPfad } from "./scanner.js";
import { DANKE_COOKIE } from "./danke.js";
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
export function kernProxy(request, event, { danke, weiter, zaehlen, } = {}) {
    if (istScannerPfad(request.nextUrl.pathname)) {
        return new NextResponse(null, { status: 404, headers: { "cache-control": "public, max-age=86400" } });
    }
    const umleitung = danke?.umleitung(request.nextUrl.pathname, request.cookies.get(DANKE_COOKIE)?.value);
    if (umleitung)
        return NextResponse.redirect(new URL(umleitung, request.url));
    const konfig = matomoKonfig();
    if (konfig) {
        const aufruf = {
            method: request.method,
            url: request.url,
            headers: request.headers,
            optOutCookie: request.cookies.get(MATOMO_OPT_OUT_COOKIE)?.value,
        };
        if (sollGezaehltWerden(aufruf) && (zaehlen?.(request.url) ?? true))
            event.waitUntil(seitenaufrufMelden(aufruf, konfig));
    }
    // Eigene Regeln der Website (z. B. Weiterleitungen) zuletzt.
    return weiter?.(request) ?? NextResponse.next();
}
/** Zum Abgleich: diese Liste steht wörtlich in `config.matcher` der proxy.ts. */
export const KERN_MATCHER = [
    "/((?!api/|_next/|_vercel/|webhook/|.*\\.[a-zA-Z0-9]+$).*)",
    "/((?:.*/)?\\.(?!well-known).*)",
    "/(.*\\.php.*)",
];
