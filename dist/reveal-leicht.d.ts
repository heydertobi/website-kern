import { type ReactNode } from "react";
/**
 * Blendet Inhalte beim Scrollen ein, ohne GSAP: IntersectionObserver plus
 * CSS-Uebergang. Fuer Websites, die sonst kein GSAP laden (Website-Standard S9).
 * Die Werte stehen direkt am Element, die Website braucht dafuer kein eigenes CSS.
 *
 * - Einmalig: Nach dem ersten Erscheinen meldet sich der Observer ab.
 * - Springt die Seite in einem Frame hinter das Element (Taste Ende,
 *   wiederhergestellte Scrollposition, Anker), wechselt der Sichtbarkeitszustand
 *   nie und der Observer bliebe stumm. Deshalb zusaetzlich beim Scrollen
 *   pruefen, ob das Element schon oberhalb des Fensters liegt.
 * - Ohne IntersectionObserver wird sofort gezeigt: Inhalt bleibt nie unsichtbar.
 * - `prefers-reduced-motion`: sofort sichtbar, ohne Uebergang.
 * - `immediate` fuer den ersten Bildschirm: ohne Ausblenden gerendert.
 * - `data-sichtbar` steht am Element ("true" nach dem Einblenden). Kinder koennen
 *   daran haengen, wenn die Website `className="group/reveal"` mitgibt:
 *   `group-data-[sichtbar=true]/reveal:scale-x-100`.
 */
export declare function RevealLeicht({ children, delay, className, immediate, versatz, dauer, kurve, schwelle, rand, as: Tag, }: {
    children: ReactNode;
    /** Versatz in Millisekunden, fuer gestaffelte Reihen. */
    delay?: number;
    className?: string;
    /** Erster Bildschirm: sofort sichtbar rendern, wartet nicht auf JavaScript. */
    immediate?: boolean;
    /** Startversatz nach unten, CSS-Laenge. */
    versatz?: string;
    /** Dauer des Uebergangs in Millisekunden. */
    dauer?: number;
    /** Kurve des Uebergangs (Standard entspricht Tailwind ease-out). */
    kurve?: string;
    /** threshold des IntersectionObservers. */
    schwelle?: number;
    /** rootMargin des IntersectionObservers. */
    rand?: string;
    as?: "div" | "section" | "li";
}): import("react").JSX.Element;
