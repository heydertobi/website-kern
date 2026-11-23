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

export const DANKE_COOKIE = "danke";

export type DankeSchutz = ReturnType<typeof dankeSchutz>;

const ohneSchraegstrich = (pfad: string) => (pfad.length > 1 ? pfad.replace(/\/$/, "") : pfad);

/**
 * @param seiten Danke-Seite (ohne Schrägstrich am Ende) → Seite, auf die ein
 *   direkter Aufruf zurückgeleitet wird.
 * @param gueltigSekunden Wie lange das Cookie gilt. Standard 10 Minuten, damit
 *   Neuladen der Danke-Seite möglich bleibt.
 */
export function dankeSchutz(seiten: Record<string, string>, { gueltigSekunden = 600 }: { gueltigSekunden?: number } = {}) {
  const liste: Record<string, string> = {};
  for (const [danke, ziel] of Object.entries(seiten)) liste[ohneSchraegstrich(danke)] = ziel;

  /** Wohin umgeleitet wird, oder null, wenn die Seite angezeigt werden darf. */
  function umleitung(pfad: string, cookie: string | undefined): string | null {
    const p = ohneSchraegstrich(pfad);
    const ziel = liste[p];
    if (!ziel) return null;
    return cookie === p ? null : ziel;
  }

  /** Cookie für die Erfolgs-Antwort. Null, wenn der Pfad keine Danke-Seite ist. */
  function cookie(danke: string) {
    const pfad = ohneSchraegstrich(danke);
    if (!liste[pfad]) return null;
    return {
      name: DANKE_COOKIE,
      value: pfad,
      // Pfad ohne Schrägstrich: gilt für /danke-x und /danke-x/
      path: pfad,
      maxAge: gueltigSekunden,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };
  }

  /** Für Server-Aktionen: direkt vor redirect(pfad) aufrufen. */
  async function freigeben(pfad: string): Promise<void> {
    const c = cookie(pfad);
    if (!c) throw new Error(`Keine Danke-Seite im Danke-Schutz: ${pfad}`);
    // Dynamisch importiert, damit umleitung() ohne Next testbar bleibt.
    const { cookies } = await import("next/headers");
    (await cookies()).set(c);
  }

  return { seiten: liste as Readonly<Record<string, string>>, umleitung, cookie, freigeben };
}
