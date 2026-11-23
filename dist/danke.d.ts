/**
 * Danke-Seiten nur nach echtem Absenden.
 *
 * Das Formular schickt an eine API-Route. Deren Erfolgs-Antwort setzt ein
 * kurzlebiges Cookie, das nur auf genau der Danke-Seite dieses Formulars
 * mitgeschickt wird; erst danach springt der Client dorthin. Der Proxy
 * (kernProxy) leitet jeden Aufruf ohne dieses Cookie zurück zum Formular. So
 * landen weder Bots noch Lesezeichen noch geteilte Links auf der Danke-Seite,
 * und Matomo zählt dort nur echte Anfragen.
 *
 * Einbau (lib/danke.ts der Website):
 *   export const danke = dankeSchutz({ "/danke-anfrage": "/anfrage/" });
 * API-Route:   antwort.cookies.set(danke.cookie("/danke-anfrage")!)
 * Server-Aktion: await danke.freigeben("/danke-anfrage"); redirect(...)
 */
export declare const DANKE_COOKIE = "danke";
export type DankeSchutz = ReturnType<typeof dankeSchutz>;
/**
 * @param seiten Danke-Seite (ohne Schrägstrich am Ende) → Seite, auf die ein
 *   direkter Aufruf zurückgeleitet wird.
 * @param gueltigSekunden Wie lange das Cookie gilt. Standard 10 Minuten, damit
 *   Neuladen der Danke-Seite möglich bleibt.
 */
export declare function dankeSchutz(seiten: Record<string, string>, { gueltigSekunden }?: {
    gueltigSekunden?: number;
}): {
    seiten: Readonly<Record<string, string>>;
    umleitung: (pfad: string, cookie: string | undefined) => string | null;
    cookie: (danke: string) => {
        name: string;
        value: string;
        path: string;
        maxAge: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax";
    } | null;
    freigeben: (pfad: string) => Promise<void>;
};
