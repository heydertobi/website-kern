"use client";

import { useEffect, useRef } from "react";
// GSAP kommt per dynamischem Import erst nach dem ersten Zeichnen der Seite
// (Lighthouse: rund 46 KB weniger im ersten Paket). Bis dahin sind die Bloecke
// per CSS (.gsap-reveal) ausgeblendet und blenden danach wie gewohnt ein.
import type { gsap as GsapTyp } from "gsap";
// Nur der Typ - der Import wird beim Bauen entfernt. Das Plugin selbst kommt
// weiter unten per dynamischem Import und nur dann, wenn ein Preset Text
// zerlegt. Sonst laegen 3,6 KB auf jeder Seite, die sie nie braucht.
import type { SplitText as SplitTextTyp } from "gsap/SplitText";
import { MOTION_PRESETS, type MotionPreset, type PresetDefinition } from "./motion-presets.ts";

const cn = (...klassen: (string | undefined | false)[]) => klassen.filter(Boolean).join(" ");

/* Einmal laden, von allen Reveal-Bloecken gemeinsam genutzt. */
let gsapLaden: Promise<typeof GsapTyp> | null = null;
function ladeGsap() {
  gsapLaden ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return g.gsap;
  });
  return gsapLaden;
}

/**
 * Blendet Inhalte beim Scrollen ein - ueber GSAP ScrollTrigger.
 *
 * WICHTIGER UNTERSCHIED ZU LENIS: ScrollTrigger **hoert dem Scrollen nur zu**
 * und startet Animationen an bestimmten Positionen. Das native Scrollen bleibt
 * unangetastet. Lenis dagegen ersetzt das Scrollen komplett - es faengt die
 * Events ab und bewegt die Seite selbst. Genau das ist hier haengen geblieben.
 * Deshalb: ScrollTrigger ja, Scroll-Hijacking nein.
 *
 * `preset` waehlt die Bewegung aus `lib/motion-presets.ts`. Alle Varianten
 * lassen sich unter `/motion` (nur lokal) nebeneinander ansehen.
 *
 * `stagger` laesst die direkten Kinder nacheinander erscheinen - fuer Listen
 * und Kartenraster. Ohne `stagger` bewegt sich der Block als Ganzes.
 *
 * Bei `prefers-reduced-motion` passiert nichts; der Inhalt ist sofort da.
 *
 * `oben` ist fuer den ersten Bildschirm: Der Block bekommt die Klasse
 * `reveal-oben` (Einblendung per CSS der Website, Verzug ueber `--verzug`) und
 * wartet nicht auf JavaScript. `start` verschiebt den Startpunkt, `presets`
 * ersetzt einzelne Presets durch eigene Werte der Website.
 */
export function Reveal({
  children,
  className,
  preset = "fade-up",
  stagger = false,
  staggerAb = "start",
  delay = 0,
  dauer,
  ease,
  as: Tag = "div",
  oben = false,
  start = "top 88%",
  presets,
  id,
  ...daten
}: {
  children: React.ReactNode;
  className?: string;
  preset?: MotionPreset;
  /** Kinder nacheinander einblenden statt den Block als Ganzes */
  stagger?: boolean;
  /** Reihenfolge beim Stagger - von vorn oder aus der Mitte heraus */
  staggerAb?: "start" | "center" | "end";
  delay?: number;
  /** Ueberschreibt die Dauer des Presets. Nur fuer das Motion-Labor gedacht. */
  dauer?: number;
  /** Ueberschreibt die Kurve des Presets. Nur fuer das Motion-Labor gedacht. */
  ease?: string;
  as?: "div" | "section" | "ul" | "ol" | "li" | "h1" | "h2" | "span" | "blockquote";
  /** Erster Bildschirm: reine CSS-Einblendung (Klasse reveal-oben), wartet nicht auf JavaScript. */
  oben?: boolean;
  /** Startpunkt des ScrollTriggers, Standard "top 88%". */
  start?: string;
  /** Eigene Werte der Website fuer einzelne Presets. */
  presets?: Partial<Record<MotionPreset, PresetDefinition>>;
  /** Anker-ID (Menuespruenge) */
  id?: string;
  /** data-Attribute werden durchgereicht. */
  [daten: `data-${string}`]: string | undefined;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || oben) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const def = presets?.[preset] ?? MOTION_PRESETS[preset];
    let ctx: ReturnType<typeof GsapTyp.context> | null = null;
    let split: SplitTextTyp | null = null;
    let abgebrochen = false;

    const starten = async () => {
      const gsap = await ladeGsap();
      if (abgebrochen) return;
      // Zerlegende Presets brauchen das Plugin - alle anderen nicht.
      let SplitTextKlasse: typeof SplitTextTyp | null = null;
      if (def.split) {
        ({ SplitText: SplitTextKlasse } = await import("gsap/SplitText"));
        gsap.registerPlugin(SplitTextKlasse);
        if (abgebrochen) return;
      }

      ctx = gsap.context(() => {
        let ziele: Element[];

        if (def.split && SplitTextKlasse) {
          // Bei zerlegtem Text bewegen sich die Zeilen bzw. Woerter. Der
          // Container muss dann sofort sichtbar sein, sonst bleibt alles weg.
          gsap.set(el, { opacity: 1 });
          split = new SplitTextKlasse(el, {
            type: def.split,
            linesClass: "gsap-zeile",
          });
          ziele = def.split === "lines" ? split.lines : split.words;
        } else if (stagger) {
          // Dasselbe beim Stagger: animiert werden die Kinder, nicht der Block.
          gsap.set(el, { opacity: 1 });
          ziele = Array.from(el.children);
        } else {
          ziele = [el];
        }

        if (!ziele.length) return;

        const versatz = def.stagger ?? (stagger ? 0.12 : 0);

        gsap.fromTo(ziele, def.von, {
          ...def.nach,
          duration: dauer ?? def.dauer,
          delay,
          ease: ease ?? def.ease,
          stagger: versatz ? { each: versatz, from: staggerAb } : 0,
          onComplete: () => {
            // clip-path und filter wuerden sonst als Eigenschaft stehen
            // bleiben und einen Containing-Block bilden - das bricht sticky
            // bei Nachfahren.
            if (def.aufraeumen) gsap.set(ziele, def.aufraeumen);
            // Zeilenumbrueche zuruecknehmen, damit der Text bei einer
            // Fensteraenderung wieder normal umbricht.
            split?.revert();
          },
          scrollTrigger: {
            trigger: el,
            // Standard: startet, wenn die Oberkante 88 % der Fensterhoehe
            // erreicht - also kurz nachdem der Block ins Bild kommt.
            start,
            once: true,
          },
        });
      }, el);
    };

    void starten();

    return () => {
      abgebrochen = true;
      split?.revert();
      ctx?.revert();
    };
  }, [preset, stagger, staggerAb, delay, dauer, ease, oben, start, presets]);

  return (
    <Tag
      // @ts-expect-error - ref-Typ variiert je nach Tag
      ref={ref}
      id={id}
      {...daten}
      className={cn(oben ? "reveal-oben" : "gsap-reveal", className)}
      style={oben && delay ? ({ "--verzug": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
