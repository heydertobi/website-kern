// Ausführen: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { istScannerPfad } from "../src/scanner.ts";

test("Scanner-Pfade werden erkannt", () => {
  for (const p of ["/.git/HEAD", "/.env", "/wp-admin/", "/wp-login.php", "/xmlrpc.php", "/phpmyadmin", "/index.php", "/cgi-bin/x"]) assert.equal(istScannerPfad(p), true, p);
});

test("normale Seiten und .well-known bleiben frei", () => {
  for (const p of ["/", "/kontakt/", "/.well-known/security.txt"]) assert.equal(istScannerPfad(p), false, p);
});
