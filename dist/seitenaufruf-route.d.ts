import { type NextRequest } from "next/server";
/**
 * Nimmt Seitenwechsel innerhalb der App entgegen (<Seitenwechsel />) und meldet
 * sie serverseitig an Matomo. Antwortet immer sofort mit 204.
 *
 * app/api/seitenaufruf/route.ts:  export { POST } from "@dertobi/website-kern/seitenaufruf-route";
 */
export declare const POST: (request: NextRequest) => Promise<Response>;
/**
 * Wie POST, mit eigener Zählregel der Website (dieselbe wie in kernProxy):
 *   export const POST = seitenaufrufRoute({ zaehlen: istBekannteSeite });
 */
export declare function seitenaufrufRoute({ zaehlen }?: {
    zaehlen?: (url: string) => boolean;
}): (request: NextRequest) => Promise<Response>;
