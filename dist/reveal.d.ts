import { type MotionPreset } from "./motion-presets.js";
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
 */
export declare function Reveal({ children, className, preset, stagger, staggerAb, delay, dauer, ease, as: Tag, }: {
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
    as?: "div" | "section" | "ul" | "li" | "h1" | "h2" | "span";
}): import("react").JSX.Element;
