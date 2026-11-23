// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DANKE_COOKIE, dankeSchutz } from "../src/danke.ts";

const danke = dankeSchutz({
  "/danke-waermepumpenanfrage": "/waermepumpenanfrage/",
  "/danke-kundendienstanfrage/": "/kundendienstanfrage/",
  "/danke-bewerbung": "/karriere/",
});

test("Danke-Seite ohne Cookie leitet zum Formular (mit und ohne Schrägstrich)", () => {
  assert.equal(danke.umleitung("/danke-kundendienstanfrage/", undefined), "/kundendienstanfrage/");
  assert.equal(danke.umleitung("/danke-waermepumpenanfrage/", undefined), "/waermepumpenanfrage/");
  assert.equal(danke.umleitung("/danke-bewerbung", undefined), "/karriere/");
});

test("Danke-Seite mit passendem Cookie wird angezeigt", () => {
  assert.equal(danke.umleitung("/danke-bewerbung/", "/danke-bewerbung"), null);
  assert.equal(danke.umleitung("/danke-kundendienstanfrage/", "/danke-kundendienstanfrage"), null);
});

test("Cookie einer anderen Danke-Seite reicht nicht", () => {
  assert.equal(danke.umleitung("/danke-bewerbung/", "/danke-kundendienstanfrage"), "/karriere/");
});

test("andere Seiten sind nicht betroffen", () => {
  assert.equal(danke.umleitung("/kundendienstanfrage/", undefined), null);
  assert.equal(danke.umleitung("/", undefined), null);
});

test("Cookie für die API-Antwort: nur für bekannte Danke-Seiten, nur dort gültig", () => {
  const c = danke.cookie("/danke-waermepumpenanfrage/");
  assert.ok(c);
  assert.equal(c.name, DANKE_COOKIE);
  assert.equal(c.value, "/danke-waermepumpenanfrage");
  assert.equal(c.path, "/danke-waermepumpenanfrage");
  assert.equal(c.maxAge, 600);
  assert.equal(c.httpOnly, true);
  assert.equal(danke.umleitung("/danke-waermepumpenanfrage/", c.value), null);
  assert.equal(danke.cookie("/impressum/"), null);
});

test("Gültigkeit lässt sich einstellen", () => {
  assert.equal(dankeSchutz({ "/danke": "/kontakt/" }, { gueltigSekunden: 60 }).cookie("/danke")?.maxAge, 60);
});
