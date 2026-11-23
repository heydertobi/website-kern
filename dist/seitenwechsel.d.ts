/**
 * Meldet Seitenwechsel innerhalb der App an die eigene Website
 * (/api/seitenaufruf/), die sie serverseitig an Matomo weitergibt. Gesendet
 * werden nur die neue Adresse und die vorige Seite. Es wird nichts im Browser
 * gespeichert und nichts vom Gerät ausgelesen. Den ersten Aufruf zählt der
 * Proxy selbst, deshalb meldet diese Komponente erst ab dem ersten Wechsel.
 *
 * Pfad MIT abschließendem Schrägstrich: next.config hat trailingSlash: true,
 * ein POST ohne Schrägstrich bekäme 308 zurück — dem folgt sendBeacon nicht,
 * die Meldung ginge sonst verloren.
 */
/** Endpunkt mit Schrägstrich, wenn next.config trailingSlash: true setzt (Standard der Vorlage). */
export declare function Seitenwechsel({ endpunkt }?: {
    endpunkt?: string;
}): null;
