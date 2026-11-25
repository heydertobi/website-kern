import { type MotionPreset, type PresetDefinition } from "./motion-presets.js";
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
export declare function Reveal({ children, className, preset, stagger, staggerAb, delay, dauer, ease, as: Tag, oben, start, presets, id, ...daten }: {
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
}): import("react").JSX.Element;
