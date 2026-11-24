# @dertobi/website-kern

Gemeinsame Bausteine aller Kunden-Websites. Regel S6 im Website-Standard
(Skill website-prozess, standard.md): Diese Dateien gibt es nur hier,
nie als Kopie im Kundenprojekt. Fehlt etwas, wird das Paket erweitert und eine
neue Version veröffentlicht.

| Import | Inhalt |
|---|---|
| `@dertobi/website-kern/proxy` | `kernProxy()`: Scanner-Abwehr, Danke-Schutz, serverseitige Matomo-Meldung, optional `zaehlen(url)` als eigene Zählregel und `weiter(request)` für eigene Regeln; `KERN_MATCHER` |
| `@dertobi/website-kern/danke` | `dankeSchutz({ "/danke-x": "/formular/" })` mit `umleitung`, `cookie`, `freigeben` |
| `@dertobi/website-kern/scanner` | `istScannerPfad()` |
| `@dertobi/website-kern/matomo` | serverseitige Reichweitenmessung (keine Cookies, kein Skript im Browser) |
| `@dertobi/website-kern/seitenaufruf-route` | `POST` für `app/api/seitenaufruf/route.ts`; mit eigener Zählregel `seitenaufrufRoute({ zaehlen })` |
| `@dertobi/website-kern/seitenwechsel` | `<Seitenwechsel />` meldet Seitenwechsel in der App |
| `@dertobi/website-kern/robots` | `kernRobots()` mit Indexierungs-Sperre vor dem Livegang und KI-Crawlern |
| `@dertobi/website-kern/next-config` | `mitKern(config)`: noindex für `*.vercel.app` |
| `@dertobi/website-kern/reveal` | `<Reveal preset="fade-up">` über GSAP ScrollTrigger, reduced-motion eingebaut |
| `@dertobi/website-kern/motion-presets` | Katalog der Einblend-Bewegungen (für `/motion`) |
| `@dertobi/website-kern/interaktion.css` | Hover, Drücken, Fokus (Bewegungskatalog B1 bis B4) |
| `npx website-kern-llms-full` | erzeugt `public/llms-full.txt` (Volltext aller öffentlichen Seiten, S22); `--basis http://localhost:3123` gegen den lokalen Build, Domain aus `public/llms.txt` |

Einbau zeigt die Website-Vorlage (proxy.ts, lib/danke.ts,
app/robots.ts, next.config.ts, app/globals.css).

## Entwickeln

```bash
npm install
npm test        # node --test, Typen werden entfernt (Node ≥ 23)
npm run build   # schreibt dist/ (wird mit eingecheckt, damit die Installation ohne Bauschritt läuft)
```

Neue Version: `version` in package.json heben, `npm run build`, committen,
Tag `vX.Y.Z` setzen und pushen. Websites heben mit
`npm install git+https://github.com/heydertobi/website-kern.git#vX.Y.Z`.

## Regeln für dieses Paket

- Keine Kundendaten, keine Domains, keine Schlüssel. Alles Kundenspezifische kommt als Argument.
- Jede Funktion ohne Next-Abhängigkeit hat einen Test in `test/`.
- Änderungen, die Websites brechen, nur mit neuer Hauptversion.
