// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { matomoKonfig, oeffentlicheUrl, sollGezaehltWerden, trackingUrl, type Aufruf } from "../src/matomo.ts";

const k = (h: Record<string, string>) => new Headers(h);
// Ein echter Browser schickt immer Sprache und Kennung mit.
const BROWSER = { "accept-language": "de-DE,de;q=0.9", "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1" };
const aufruf = (h: Record<string, string>, extra: Partial<Aufruf> = {}): Aufruf => ({
  method: "GET",
  url: "https://example.org/angebote?x=1",
  headers: k({ ...BROWSER, ...h }),
  ...extra,
});

test("Roboter ohne Browsersprache, mit chinesischer Sprache oder Roboter-Kennung zählen nicht", () => {
  const seite = { "sec-fetch-dest": "document" };
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "accept-language": "" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "accept-language": "zh-CN,zh;q=0.9" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "accept-language": "zh" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "user-agent": "Mozilla/5.0 (compatible; GPTBot/1.2)" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "user-agent": "Mozilla/5.0 HeadlessChrome/140.0" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "user-agent": "" })), false);
});

test("Menschen mit anderer Sprache zählen weiter", () => {
  const seite = { "sec-fetch-dest": "document" };
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "accept-language": "en-US,en;q=0.9" })), true);
  assert.equal(sollGezaehltWerden(aufruf({ ...seite, "accept-language": "tr-TR,tr;q=0.9,de;q=0.8" })), true);
});

test("voller Seitenaufruf zählt", () => {
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document" })), true);
});

test("Seitenwechsel in der App (RSC) zählt", () => {
  assert.equal(sollGezaehltWerden(aufruf({ rsc: "1", "sec-fetch-dest": "empty" })), true);
});

test("Prefetch zählt nicht", () => {
  assert.equal(sollGezaehltWerden(aufruf({ rsc: "1", "next-router-prefetch": "1" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document", "sec-purpose": "prefetch;prerender" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document", purpose: "prefetch" })), false);
});

test("Bilder, Skripte, fetch zählen nicht", () => {
  for (const dest of ["image", "script", "style", "empty", "iframe"]) {
    assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": dest })), false, dest);
  }
});

test("Widerspruch per Cookie, GPC oder DNT zählt nicht", () => {
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document" }, { optOutCookie: "1" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document", "sec-gpc": "1" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document", dnt: "1" })), false);
});

test("nur GET", () => {
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document" }, { method: "POST" })), false);
  assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document" }, { method: "HEAD" })), false);
});

test("ältere Browser ohne Fetch-Metadata: nur HTML", () => {
  assert.equal(sollGezaehltWerden(aufruf({ accept: "text/html,application/xhtml+xml" })), true);
  assert.equal(sollGezaehltWerden(aufruf({ accept: "*/*" })), false);
});

test("_rsc wird aus der Adresse entfernt, andere Parameter bleiben", () => {
  assert.equal(oeffentlicheUrl("https://example.org/a?_rsc=abc&utm_source=x"), "https://example.org/a?utm_source=x");
});

test("Tracking-Adresse enthält IP, Browser, Herkunft und Token", () => {
  const u = new URL(
    trackingUrl(
      aufruf({
        "sec-fetch-dest": "document",
        "x-real-ip": "203.0.113.7",
        "user-agent": "Mozilla/5.0 Test",
        referer: "https://www.google.com/",
        "accept-language": "de-DE",
      }),
      { url: "https://daten.example", siteId: "2", token: "geheim" },
      "123",
    ),
  );
  assert.equal(u.origin + u.pathname, "https://daten.example/matomo.php");
  const p = u.searchParams;
  assert.equal(p.get("idsite"), "2");
  assert.equal(p.get("rec"), "1");
  assert.equal(p.get("url"), "https://example.org/angebote?x=1");
  assert.equal(p.get("cip"), "203.0.113.7");
  assert.equal(p.get("ua"), "Mozilla/5.0 Test");
  assert.equal(p.get("urlref"), "https://www.google.com/");
  assert.equal(p.get("lang"), "de-DE");
  assert.equal(p.get("token_auth"), "geheim");
});

test("ohne vollständige Konfiguration wird nichts gemeldet", () => {
  assert.equal(matomoKonfig({ MATOMO_URL: "https://x", MATOMO_SITE_ID: "2" }), null);
  assert.deepEqual(matomoKonfig({ MATOMO_URL: "https://x/", MATOMO_SITE_ID: "2", MATOMO_TRACKING_TOKEN: "t" }), {
    url: "https://x",
    siteId: "2",
    token: "t",
  });
});

test("Meldung eines Seitenwechsels: nur eigener Host, Widerspruch zählt", async () => {
  const { aufrufAusMeldung } = await import("../src/matomo.ts");
  const anfrage = { url: "https://example.org/api/seitenaufruf", headers: k({ "user-agent": "UA", "x-real-ip": "203.0.113.7" }) };
  const a = aufrufAusMeldung({ url: "https://example.org/verein", ref: "https://example.org/" }, anfrage);
  assert.ok(a);
  const p = new URL(trackingUrl(a, { url: "https://d", siteId: "2", token: "t" })).searchParams;
  assert.equal(p.get("url"), "https://example.org/verein");
  assert.equal(p.get("urlref"), "https://example.org/");
  assert.equal(p.get("ua"), "UA");
  assert.equal(p.get("cip"), "203.0.113.7");
  assert.equal(aufrufAusMeldung({ url: "https://fremd.example/x" }, anfrage), null);
  assert.equal(aufrufAusMeldung({ url: "kein url" }, anfrage), null);
  assert.equal(aufrufAusMeldung(null, anfrage), null);
  assert.equal(aufrufAusMeldung({ url: "https://example.org/x" }, { ...anfrage, optOutCookie: "1" }), null);
  assert.equal(aufrufAusMeldung({ url: "https://example.org/x" }, { ...anfrage, headers: k({ "sec-gpc": "1" }) }), null);
});

test("Scanner-Pfade zählen nicht", async () => {
  const { istScannerPfad } = await import("../src/scanner.ts");
  for (const pfad of ["/.git/HEAD", "/.git/HEAD/", "/.svn/entries", "/.env", "/wp-admin/", "/wp-login.php", "/xmlrpc.php", "/team/.DS_Store", "/index.php/x"]) {
    assert.equal(istScannerPfad(pfad), true, pfad);
    assert.equal(sollGezaehltWerden(aufruf({ "sec-fetch-dest": "document" }, { url: `https://example.org${pfad}` })), false, pfad);
  }
  for (const pfad of ["/", "/warmepumpe/", "/karriere/shk-geselle-monteur/", "/.well-known/security.txt", "/danke-bewerbung/"]) {
    assert.equal(istScannerPfad(pfad), false, pfad);
  }
});

test("lokale Entwicklung zählt nie", () => {
  const env = { MATOMO_URL: "https://m.example/", MATOMO_SITE_ID: "1", MATOMO_TRACKING_TOKEN: "t" };
  assert.deepEqual(matomoKonfig(env), { url: "https://m.example", siteId: "1", token: "t" });
  assert.equal(matomoKonfig({ ...env, NODE_ENV: "development" }), null);
});
