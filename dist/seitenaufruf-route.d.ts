import { type NextRequest } from "next/server";
/**
 * Nimmt Seitenwechsel innerhalb der App entgegen (<Seitenwechsel />) und meldet
 * sie serverseitig an Matomo. Antwortet immer sofort mit 204.
 *
 * app/api/seitenaufruf/route.ts:  export { POST } from "@dertobi/website-kern/seitenaufruf-route";
 */
export declare function POST(request: NextRequest): Promise<Response>;
