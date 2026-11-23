/** *.vercel.app nie indexieren: Duplikate der echten Domain. Gilt für Seiten und Dateien. */
export const VERCEL_NOINDEX = {
    source: "/:path*",
    has: [{ type: "host", value: "(?<vercel>.*)\\.vercel\\.app" }],
    headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
};
/**
 * next.config.ts jeder Kunden-Website:
 *   export default mitKern({ trailingSlash: true, … });
 * Ergänzt den noindex-Kopf für *.vercel.app, ohne eigene headers() zu verlieren.
 */
export function mitKern(config = {}) {
    const eigene = config.headers;
    return {
        ...config,
        async headers() {
            return [VERCEL_NOINDEX, ...(eigene ? await eigene() : [])];
        },
    };
}
