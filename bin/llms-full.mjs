#!/usr/bin/env node
/**
 * website-kern-llms-full: erzeugt public/llms-full.txt (Website-Standard S22).
 * Volltext aller öffentlichen Seiten aus der Sitemap als Markdown (nur <main>),
 * ohne Rechtstexte, Danke-Seiten und Seiten mit noindex.
 *
 * Aufruf im Website-Ordner (gegen den lokalen Produktions-Build, schont die Live-Seite):
 *   npm run build && npx next start -p 3123 &
 *   npx website-kern-llms-full --basis http://localhost:3123
 * Ohne --basis wird die Live-Domain gelesen.
 *
 * Domain: --domain, sonst LLMS_DOMAIN, sonst die erste Adresse in public/llms.txt.
 * Kopf (# Name, > Kurzbeschreibung) kommt aus public/llms.txt.
 * Bei jeder Inhaltsänderung neu erzeugen und mit committen; S22 meldet, wenn sie veraltet.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_ = process.cwd();
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const llmsText = readFileSync(resolve(ROOT_, "public/llms.txt"), "utf8");
const DOMAIN = (arg("--domain") ?? process.env.LLMS_DOMAIN ?? llmsText.match(/https?:\/\/[^/\s)"'>]+/)?.[0] ?? "").replace(/\/$/, "");
if (!DOMAIN) { console.error("Domain unbekannt: --domain https://kunde.de angeben"); process.exit(1); }
// Nicht aufnehmen: Rechtstexte, Danke-/Formular-/noindex-Seiten.
const AUSSCHLUSS = [/\/impressum/, /\/datenschutz/, /\/danke/, /\/agb/];
// Textblöcke, die kein Inhalt sind: --entfernen "Regex" (mehrfach möglich)
const ENTFERNEN = process.argv.flatMap((a, i) => (process.argv[i - 1] === "--entfernen" ? [new RegExp(a, "g")] : []));

const BASIS = (arg("--basis") ?? DOMAIN).replace(/\/$/, "");
const ROOT = ROOT_;

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "", ndash: "–", mdash: "—", hellip: "…", bdquo: "„", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", sbquo: "‚", euro: "€", copy: "©", reg: "®", trade: "™", middot: "·", auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß", times: "×", deg: "°", sup2: "²", sup3: "³", laquo: "«", raquo: "»" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const SKIP = new Set(["script", "style", "svg", "noscript", "template", "form", "fieldset", "nav", "select", "textarea", "iframe", "video", "audio", "canvas", "picture", "figure"]);
const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "aside", "ul", "ol", "dl", "dt", "dd", "table", "tr", "blockquote", "address", "details", "main"]);

function htmlZuMarkdown(html, seitenUrl) {
  const tokens = html.match(/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+|</g) ?? [];
  let out = "";
  let skipTiefe = 0; // >0 = innerhalb eines übersprungenen Elements
  const linkStack = [];
  const fettStack = [];
  let listeTiefe = 0;
  for (const t of tokens) {
    if (t.startsWith("<!--")) continue;
    const m = t.match(/^<(\/?)([a-zA-Z0-9-]+)([^>]*)>$/);
    if (!m) {
      if (skipTiefe) continue;
      out += decode(t).replace(/\s+/g, " ");
      continue;
    }
    const [, zu, rohName, attrs] = m;
    const name = rohName.toLowerCase();
    const selbst = VOID.has(name) || /\/\s*$/.test(attrs);
    if (skipTiefe) {
      if (selbst) continue;
      skipTiefe += zu ? -1 : 1;
      continue;
    }
    if (!zu && !selbst) {
      const versteckt = /aria-hidden="true"/.test(attrs) || /\shidden(\s|=|\/|$)/.test(attrs.replace(/"[^"]*"/g, '""'));
      if (SKIP.has(name) || versteckt) {
        skipTiefe = 1;
        continue;
      }
    }
    if (name === "br") { out += "\n"; continue; }
    if (/^h[1-6]$/.test(name)) {
      out += zu ? "\n\n" : `\n\n${"#".repeat(Math.min(6, Number(name[1]) + 1))} `;
      continue;
    }
    if (name === "li") { if (!zu) out += `\n${"  ".repeat(Math.max(0, listeTiefe - 1))}- `; continue; }
    if (name === "ul" || name === "ol") { listeTiefe += zu ? -1 : 1; out += "\n"; continue; }
    if (name === "a") {
      if (!zu) {
        const href = attrs.match(/href="([^"]*)"/)?.[1];
        linkStack.push({ href: href ? decode(href) : null, start: out.length });
      } else {
        const l = linkStack.pop();
        if (l?.href && !l.href.startsWith("#") && !l.href.startsWith("javascript:")) {
          const text = out.slice(l.start).trim();
          let ziel = l.href;
          if (ziel.startsWith("/")) ziel = DOMAIN + ziel;
          // Inline-Link → [Text](Adresse); Karten-Link über mehrere Blöcke → Text + Adresse darunter
          if (text && !text.includes("\n")) out = out.slice(0, l.start) + ` [${text}](${ziel}) `;
          else if (text) out += `\n\n→ ${ziel}\n\n`;
        }
      }
      continue;
    }
    if (name === "strong" || name === "b" || name === "summary") {
      if (name === "summary") out += "\n\n";
      if (!zu) { fettStack.push(out.length); continue; }
      const start = fettStack.pop();
      if (start === undefined) continue;
      const inhalt = out.slice(start);
      const kern = inhalt.trim();
      // Leerraum gehört außerhalb der Sternchen, sonst ist es kein Fettdruck
      if (kern && !kern.includes("\n")) out = out.slice(0, start) + inhalt.match(/^\s*/)[0] + `**${kern}**` + inhalt.match(/\s*$/)[0];
      continue;
    }
    if (name === "td" || name === "th") { out += zu ? "" : " | "; continue; }
    if (BLOCK.has(name)) { out += "\n\n"; continue; }
    if (name === "span" && zu) { out += " "; continue; }
  }
  return out
    .split("\n")
    .map((z) => z.replace(/[ \t]+/g, " ").replace(/^ (?=\S)/, "").trimEnd())
    .join("\n")
    .replace(/^ *- *$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function holen(pfad) {
  const res = await fetch(BASIS + pfad, { headers: { "User-Agent": "website-kern-llms-full", "Accept-Language": "de" }, redirect: "follow" });
  if (!res.ok) throw new Error(`${pfad}: HTTP ${res.status}`);
  return res.text();
}

const sitemap = await holen("/sitemap.xml");
const pfade = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1].trim()).pathname)
  .filter((p) => !AUSSCHLUSS.some((r) => r.test(p)));

const llms = llmsText;
const kopf = llms.match(/^# .+$/m)?.[0] ?? "# " + DOMAIN;
const kurz = llms.match(/^(> .*\n?)+/m)?.[0].trim() ?? "";

const teile = [
  kopf,
  "",
  kurz,
  "",
  `Volltext aller öffentlichen Seiten von ${DOMAIN} als Markdown (ohne Impressum und Datenschutz). Übersicht: ${DOMAIN}/llms.txt`,
];
let n = 0;
for (const pfad of pfade) {
  const html = await holen(pfad);
  if (/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) continue;
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/i)?.[1];
  if (!main) { console.warn("kein <main>:", pfad); continue; }
  const h1 = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const titelTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? pfad;
  const titel = decode((h1 ?? titelTag).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  // H1 steht schon als Seitentitel → im Text weglassen
  let text = htmlZuMarkdown(main.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, ""), DOMAIN + pfad);
  for (const r of ENTFERNEN) text = text.replace(r, "").replace(/\n{3,}/g, "\n\n").trim();
  teile.push("", "---", "", `## ${titel}`, "", `Quelle: ${DOMAIN}${pfad === "/" ? "/" : pfad}`, "", text);
  n++;
}

const ziel = resolve(ROOT, "public/llms-full.txt");
writeFileSync(ziel, teile.join("\n").replace(/\n{3,}/g, "\n\n") + "\n");
console.log(`${n} Seiten → public/llms-full.txt (${Math.round(readFileSync(ziel).length / 1024)} KB)`);
