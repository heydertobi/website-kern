/**
 * Serverseitige Reichweitenmessung mit Matomo.
 *
 * Im Browser läuft KEIN Matomo-Skript. Der Proxy (kernProxy) meldet jeden echten
 * Seitenaufruf selbst an die eigene Matomo-Instanz.
 * Gemeldet werden nur Angaben, die der Browser mit jeder Anfrage ohnehin
 * schickt: Adresse, verweisende Seite, Browserkennung, Sprache und die
 * IP-Adresse, die Matomo vor jeder Verarbeitung um zwei Bytes kürzt. Es wird
 * nichts auf dem Gerät gespeichert oder ausgelesen (§ 25 TDDDG greift nicht).
 *
 * Widerspruch: Cookie `matomo_opt_out=1`, das NUR gesetzt wird, wenn jemand
 * auf /datenschutz den Haken setzt (technisch notwendig, um den Widerspruch zu
 * beachten). Zusätzlich werden Global Privacy Control und Do Not Track beachtet.
 *
 * Diese Datei hängt bewusst nicht von Next ab, damit die Entscheidung, WAS
 * gezählt wird, ohne Server testbar bleibt (test/matomo.test.ts).
 *
 * Konfiguration (nur serverseitig, nie NEXT_PUBLIC_):
 *   MATOMO_URL             Adresse der Matomo-Instanz
 *   MATOMO_SITE_ID         Site-ID dieser Website
 *   MATOMO_TRACKING_TOKEN  Token eines Matomo-Benutzers mit Schreibrecht
 *                          (Schreibrecht), nötig für die Besucher-IP (cip).
 * Fehlt eines davon (z. B. lokal), wird nichts gemeldet.
 */
import { istScannerPfad } from "./scanner.js";
export const MATOMO_OPT_OUT_COOKIE = "matomo_opt_out";
export function matomoKonfig(env = process.env) {
    const url = env.MATOMO_URL?.replace(/\/$/, "");
    const siteId = env.MATOMO_SITE_ID;
    const token = env.MATOMO_TRACKING_TOKEN;
    if (!url || !siteId || !token)
        return null;
    return { url, siteId, token };
}
/**
 * Ist diese Anfrage ein Seitenaufruf, den ein Mensch ausgelöst hat?
 *
 * Gezählt werden volle Seitenladevorgänge (`Sec-Fetch-Dest: document`) und
 * Seitenwechsel innerhalb der App (`RSC: 1` ohne Prefetch-Kennzeichen). Nicht
 * gezählt: Vorab-Laden (Prefetch), alles außer GET, Widerspruch per Cookie,
 * GPC oder DNT, Schwachstellen-Scanner (/.git/HEAD, /wp-admin …, lib/scanner.ts).
 */
export function sollGezaehltWerden(a) {
    if (a.method !== "GET")
        return false;
    if (istScannerPfad(new URL(a.url).pathname))
        return false;
    const h = a.headers;
    if (widersprochen(a))
        return false;
    const prefetch = h.get("next-router-prefetch") !== null ||
        h.get("purpose") === "prefetch" ||
        (h.get("sec-purpose") ?? "").includes("prefetch") ||
        h.get("x-middleware-prefetch") !== null;
    if (prefetch)
        return false;
    if (h.get("rsc") === "1")
        return true;
    const dest = h.get("sec-fetch-dest");
    if (dest !== null)
        return dest === "document";
    // Ältere Browser ohne Fetch-Metadata: nur echte HTML-Anfragen
    return (h.get("accept") ?? "").includes("text/html");
}
/** Widerspruch per Cookie, Global Privacy Control oder Do Not Track. */
export function widersprochen(a) {
    if (a.optOutCookie === "1")
        return true;
    return a.headers.get("sec-gpc") === "1" || a.headers.get("dnt") === "1";
}
/**
 * Seitenwechsel innerhalb der App erreichen den Server oft gar nicht, weil
 * Next die Seite vorab geladen hat. Die Komponente <Seitenwechsel /> schickt
 * dann nur die neue Adresse und die vorige Seite an /api/seitenaufruf. Diese
 * Funktion prüft die Meldung und baut daraus einen normalen Aufruf.
 * Adressen fremder Hosts werden verworfen.
 */
export function aufrufAusMeldung(meldung, anfrage) {
    if (!meldung || typeof meldung !== "object")
        return null;
    const { url, ref } = meldung;
    if (typeof url !== "string" || url.length > 2000)
        return null;
    let ziel;
    try {
        ziel = new URL(url);
    }
    catch {
        return null;
    }
    if (ziel.host !== new URL(anfrage.url).host)
        return null;
    if (widersprochen(anfrage))
        return null;
    const referer = typeof ref === "string" && ref.length <= 2000 ? ref : null;
    const headers = {
        get: (name) => (name.toLowerCase() === "referer" ? referer : anfrage.headers.get(name)),
    };
    return { method: "GET", url: ziel.toString(), headers, optOutCookie: anfrage.optOutCookie };
}
/** Adresse ohne interne Next-Parameter (`_rsc`). */
export function oeffentlicheUrl(url) {
    const u = new URL(url);
    u.searchParams.delete("_rsc");
    return u.toString();
}
/** Besucher-IP aus den Kopfzeilen von Vercel. */
export function besucherIp(h) {
    const real = h.get("x-real-ip");
    if (real)
        return real.trim();
    const fwd = h.get("x-forwarded-for");
    return fwd ? fwd.split(",")[0].trim() : null;
}
/** Baut die Anfrage an die Matomo-Tracking-API (matomo.php). */
export function trackingUrl(a, k, zufall = String(Math.random()).slice(2, 10)) {
    const h = a.headers;
    const p = new URLSearchParams({
        idsite: k.siteId,
        rec: "1",
        apiv: "1",
        send_image: "0",
        rand: zufall,
        url: oeffentlicheUrl(a.url),
    });
    // Bei einem Seitenwechsel in der App ist der Referer die vorige Seite
    // derselben Website; Matomo wertet interne Verweise ohnehin nicht als Herkunft.
    const ref = h.get("referer");
    if (ref)
        p.set("urlref", ref);
    const ua = h.get("user-agent");
    if (ua)
        p.set("ua", ua);
    const lang = h.get("accept-language");
    if (lang)
        p.set("lang", lang);
    const ip = besucherIp(h);
    if (ip)
        p.set("cip", ip);
    p.set("token_auth", k.token);
    return `${k.url}/matomo.php?${p.toString()}`;
}
/** Meldet den Aufruf. Wirft nie: Messung darf keine Seite stören. */
export async function seitenaufrufMelden(a, k) {
    try {
        await fetch(trackingUrl(a, k), { method: "GET", signal: AbortSignal.timeout(3000), cache: "no-store" });
    }
    catch {
        // Matomo nicht erreichbar: Seite läuft weiter, dieser Aufruf fehlt.
    }
}
