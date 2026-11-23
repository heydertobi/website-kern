import type { NextConfig } from "next";
type Kopf = Awaited<ReturnType<NonNullable<NextConfig["headers"]>>>[number];
/** *.vercel.app nie indexieren: Duplikate der echten Domain. Gilt für Seiten und Dateien. */
export declare const VERCEL_NOINDEX: Kopf;
/**
 * next.config.ts jeder Kunden-Website:
 *   export default mitKern({ trailingSlash: true, … });
 * Ergänzt den noindex-Kopf für *.vercel.app, ohne eigene headers() zu verlieren.
 */
export declare function mitKern(config?: NextConfig): NextConfig;
export {};
