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
export declare const MATOMO_OPT_OUT_COOKIE = "matomo_opt_out";
type Kopfzeilen = {
    get(name: string): string | null;
};
export interface Aufruf {
    method: string;
    url: string;
    headers: Kopfzeilen;
    optOutCookie?: string;
}
export interface MatomoKonfig {
    url: string;
    siteId: string;
    token: string;
}
export declare function matomoKonfig(env?: Record<string, string | undefined>): MatomoKonfig | null;
/**
 * Ist diese Anfrage ein Seitenaufruf, den ein Mensch ausgelöst hat?
 *
 * Gezählt werden volle Seitenladevorgänge (`Sec-Fetch-Dest: document`) und
 * Seitenwechsel innerhalb der App (`RSC: 1` ohne Prefetch-Kennzeichen). Nicht
 * gezählt: Vorab-Laden (Prefetch), alles außer GET, Widerspruch per Cookie,
 * GPC oder DNT, Schwachstellen-Scanner (/.git/HEAD, /wp-admin …, lib/scanner.ts).
 */
export declare function sollGezaehltWerden(a: Aufruf): boolean;
/**
 * Roboter, die sich als Browser ausgeben. Gemessen im November 2026 über alle
 * Kunden-Websites: Bis zu 85 % der gezählten Besuche kamen von Flotten, die
 * keine Browsersprache schicken oder Chinesisch melden und 0 Sekunden bleiben.
 * Echte Browser schicken immer Accept-Language. Chinesische Browsersprache ist
 * bei den Kunden-Websites (deutschsprachige Betriebe) praktisch nie ein Mensch.
 * Dazu die üblichen Kennungen in der Browserkennung.
 */
export declare function istRoboter(h: Kopfzeilen): boolean;
/** Widerspruch per Cookie, Global Privacy Control oder Do Not Track. */
export declare function widersprochen(a: Pick<Aufruf, "headers" | "optOutCookie">): boolean;
/**
 * Seitenwechsel innerhalb der App erreichen den Server oft gar nicht, weil
 * Next die Seite vorab geladen hat. Die Komponente <Seitenwechsel /> schickt
 * dann nur die neue Adresse und die vorige Seite an /api/seitenaufruf. Diese
 * Funktion prüft die Meldung und baut daraus einen normalen Aufruf.
 * Adressen fremder Hosts werden verworfen.
 */
export declare function aufrufAusMeldung(meldung: unknown, anfrage: {
    url: string;
    headers: Kopfzeilen;
    optOutCookie?: string;
}): Aufruf | null;
/** Adresse ohne interne Next-Parameter (`_rsc`). */
export declare function oeffentlicheUrl(url: string): string;
/** Besucher-IP aus den Kopfzeilen von Vercel. */
export declare function besucherIp(h: Kopfzeilen): string | null;
/** Baut die Anfrage an die Matomo-Tracking-API (matomo.php). */
export declare function trackingUrl(a: Aufruf, k: MatomoKonfig, zufall?: string): string;
/** Meldet den Aufruf. Wirft nie: Messung darf keine Seite stören. */
export declare function seitenaufrufMelden(a: Aufruf, k: MatomoKonfig): Promise<void>;
export {};
