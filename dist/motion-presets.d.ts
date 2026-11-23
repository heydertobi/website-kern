/**
 * Katalog der Einblend-Bewegungen.
 *
 * Eine Stelle fuer alle Scroll-Einblender der Seite. `Reveal` aus dem Kern-Paket
 * setzt sie um, die Route `/motion` (laeuft nur lokal) zeigt sie nebeneinander
 * zum Aussuchen.
 *
 * Regeln aus MASTER.md, die hier fest eingebaut sind:
 * - Dauer 0,8-1,2 s statt der ueblichen 0,3 s
 * - kein Bounce, kein Elastic - nur ausrollende Kurven
 * - nichts laeuft im Dauerloop, alles haengt an einem Scroll-Ausloeser
 */
export type MotionPreset = "fade" | "fade-up" | "fade-weit" | "fade-links" | "fade-rechts" | "clip-hoch" | "clip-seite" | "scale-sanft" | "blur-in" | "zeilen" | "woerter" | "linie";
export type PresetDefinition = {
    /** Anzeigename im Motion-Labor */
    name: string;
    /** Was passiert, in einem Satz */
    beschreibung: string;
    /** Wofuer auf dieser Seite */
    eignung: string;
    von: Record<string, string | number>;
    nach: Record<string, string | number>;
    dauer: number;
    ease: string;
    /**
     * Text vorher zerlegen. Dann bewegen sich nicht der Block, sondern seine
     * Zeilen bzw. Woerter. Braucht echten Text im Element.
     */
    split?: "lines" | "words";
    /** Versatz zwischen den Teilen bzw. den Kindern bei `stagger` */
    stagger?: number;
    /**
     * Nach der Bewegung zuruecksetzen. `clip-path` und `filter` bleiben sonst
     * als Eigenschaft stehen und bilden einen eigenen Containing-Block - das
     * bricht `position: sticky` bei Nachfahren.
     */
    aufraeumen?: Record<string, string>;
};
export declare const MOTION_PRESETS: Record<MotionPreset, PresetDefinition>;
/** Reihenfolge im Motion-Labor: von ruhig nach kraeftig. */
export declare const PRESET_REIHENFOLGE: MotionPreset[];
/**
 * Auswahl an Kurven. Bounce und Elastic fehlen absichtlich - MASTER.md
 * schliesst sie aus.
 */
export declare const EASE_AUSWAHL: {
    wert: string;
    name: string;
}[];
