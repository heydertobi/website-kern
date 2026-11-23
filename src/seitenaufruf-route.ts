import { after, type NextRequest } from "next/server";
import { MATOMO_OPT_OUT_COOKIE, aufrufAusMeldung, matomoKonfig, seitenaufrufMelden } from "./matomo.ts";

/**
 * Nimmt Seitenwechsel innerhalb der App entgegen (<Seitenwechsel />) und meldet
 * sie serverseitig an Matomo. Antwortet immer sofort mit 204.
 *
 * app/api/seitenaufruf/route.ts:  export { POST } from "@dertobi/website-kern/seitenaufruf-route";
 */
export async function POST(request: NextRequest): Promise<Response> {
  const konfig = matomoKonfig();
  if (konfig) {
    const meldung = await request.json().catch(() => null);
    const aufruf = aufrufAusMeldung(meldung, {
      url: request.url,
      headers: request.headers,
      optOutCookie: request.cookies.get(MATOMO_OPT_OUT_COOKIE)?.value,
    });
    if (aufruf) after(() => seitenaufrufMelden(aufruf, konfig));
  }
  return new Response(null, { status: 204 });
}
