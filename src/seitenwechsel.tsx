"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

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
export function Seitenwechsel({ endpunkt = "/api/seitenaufruf/" }: { endpunkt?: string } = {}) {
  const pathname = usePathname();
  const suche = useSearchParams().toString();
  const vorige = useRef<string | null>(null);

  useEffect(() => {
    const jetzt = window.location.href;
    if (vorige.current === null) {
      vorige.current = jetzt;
      return;
    }
    if (vorige.current === jetzt) return;
    const ref = vorige.current;
    vorige.current = jetzt;
    const body = JSON.stringify({ url: jetzt, ref });
    if (!navigator.sendBeacon?.(endpunkt, new Blob([body], { type: "application/json" }))) {
      fetch(endpunkt, { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  }, [pathname, suche, endpunkt]);

  return null;
}
