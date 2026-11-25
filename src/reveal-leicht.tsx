"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const REDUZIERT = "(prefers-reduced-motion: reduce)";

function abonniereBewegung(melden: () => void) {
  const abfrage = window.matchMedia(REDUZIERT);
  abfrage.addEventListener("change", melden);
  return () => abfrage.removeEventListener("change", melden);
}

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
 */
export function RevealLeicht({
  children,
  delay = 0,
  className = "",
  immediate = false,
  versatz = "1.5rem",
  dauer = 700,
  kurve = "cubic-bezier(0, 0, 0.2, 1)",
  schwelle = 0,
  rand = "0px 0px -12% 0px",
  as: Tag = "div",
}: {
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
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gesehen, setGesehen] = useState(false);
  const ruhig = useSyncExternalStore(
    abonniereBewegung,
    () => window.matchMedia(REDUZIERT).matches,
    () => false,
  );
  const sichtbar = gesehen || ruhig;

  useEffect(() => {
    const el = ref.current;
    if (!el || immediate || ruhig) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setGesehen(true));
      return () => cancelAnimationFrame(id);
    }

    let erledigt = false;
    const zeigen = () => {
      if (erledigt) return;
      erledigt = true;
      setGesehen(true);
      io.disconnect();
      window.removeEventListener("scroll", beiScroll);
    };

    const io = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) zeigen();
      },
      { threshold: schwelle, rootMargin: rand },
    );
    io.observe(el);

    let geplant = false;
    const beiScroll = () => {
      if (geplant) return;
      geplant = true;
      requestAnimationFrame(() => {
        geplant = false;
        if (el.getBoundingClientRect().top < 0) zeigen();
      });
    };
    window.addEventListener("scroll", beiScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", beiScroll);
    };
  }, [immediate, ruhig, schwelle, rand]);

  if (immediate) {
    return className ? <Tag className={className}>{children}</Tag> : <>{children}</>;
  }

  const stil: CSSProperties = ruhig
    ? {}
    : {
        opacity: sichtbar ? 1 : 0,
        transform: sichtbar ? "translateY(0)" : `translateY(${versatz})`,
        transition: `opacity ${dauer}ms ${kurve}, transform ${dauer}ms ${kurve}`,
        transitionDelay: sichtbar && delay ? `${delay}ms` : undefined,
      };

  return (
    <Tag
      // @ts-expect-error - ref-Typ variiert je nach Tag
      ref={ref}
      className={className || undefined}
      style={stil}
    >
      {children}
    </Tag>
  );
}
