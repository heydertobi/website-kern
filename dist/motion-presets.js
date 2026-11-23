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
export const MOTION_PRESETS = {
    fade: {
        name: "Aufblenden",
        beschreibung: "Nur die Deckkraft, keine Bewegung.",
        eignung: "Das Ruhigste im Katalog. Für Bilder mit ernstem Motiv und überall dort, wo nichts zappeln darf.",
        von: { opacity: 0 },
        nach: { opacity: 1 },
        dauer: 1.2,
        ease: "power1.out",
    },
    "fade-up": {
        name: "Aufblenden und anheben",
        beschreibung: "Deckkraft plus 28 Pixel von unten.",
        eignung: "Der jetzige Standard der Seite. Unauffällig, funktioniert bei Text wie bei Karten.",
        von: { opacity: 0, y: 28 },
        nach: { opacity: 1, y: 0 },
        dauer: 1.1,
        ease: "power2.out",
    },
    "fade-weit": {
        name: "Aufblenden, weiter Weg",
        beschreibung: "Dasselbe, aber 72 Pixel und langsamer.",
        eignung: "Für einzelne große Momente — eine Überschrift, ein Zitat. Nicht für jede Sektion, sonst wird die Seite träge.",
        von: { opacity: 0, y: 72 },
        nach: { opacity: 1, y: 0 },
        dauer: 1.4,
        ease: "expo.out",
    },
    "fade-links": {
        name: "Von links herein",
        beschreibung: "Kommt seitlich aus 48 Pixel Entfernung.",
        eignung: "Für versetzte Doppelspalten: Text von links, Bild von rechts. Wirkt nur, wenn die Richtung zum Layout passt.",
        von: { opacity: 0, x: -48 },
        nach: { opacity: 1, x: 0 },
        dauer: 1.1,
        ease: "power2.out",
    },
    "fade-rechts": {
        name: "Von rechts herein",
        beschreibung: "Spiegelbild zu „Von links herein“.",
        eignung: "Die Gegenseite im wechselnden Aufbau.",
        von: { opacity: 0, x: 48 },
        nach: { opacity: 1, x: 0 },
        dauer: 1.1,
        ease: "power2.out",
    },
    "clip-hoch": {
        name: "Vorhang von unten",
        beschreibung: "Das Element ist erst vollständig beschnitten und gibt sich von unten nach oben frei.",
        eignung: "Sehr redaktionell, passt zur Stil-DNA. Stark bei Bildern — das Motiv wandert nicht, es wird aufgedeckt.",
        von: { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
        nach: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        dauer: 1.3,
        ease: "power3.out",
        aufraeumen: { clipPath: "none" },
    },
    "clip-seite": {
        name: "Vorhang von links",
        beschreibung: "Dasselbe, nur quer.",
        eignung: "Für breite, flache Elemente — Bildbänder, Zitatzeilen, Trennflächen.",
        von: { clipPath: "inset(0% 100% 0% 0%)", opacity: 1 },
        nach: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        dauer: 1.2,
        ease: "power3.out",
        aufraeumen: { clipPath: "none" },
    },
    "scale-sanft": {
        name: "Sanft heranfahren",
        beschreibung: "Von 106 auf 100 Prozent, dazu Deckkraft.",
        eignung: "Nur für Bilder. Bei Text wirkt Skalierung schnell nach Werbung. Kein Dauerzoom — die Bewegung endet.",
        von: { opacity: 0, scale: 1.06 },
        nach: { opacity: 1, scale: 1 },
        dauer: 1.4,
        ease: "power2.out",
    },
    "blur-in": {
        name: "Scharfstellen",
        beschreibung: "Von 10 Pixel Unschärfe auf null.",
        eignung: "Wirkt wie ein Objektiv, das fokussiert. Schön, aber teuer: filter kostet Rechenzeit, deshalb höchstens ein- bis zweimal pro Seite.",
        von: { opacity: 0, filter: "blur(10px)" },
        nach: { opacity: 1, filter: "blur(0px)" },
        dauer: 1.2,
        ease: "power2.out",
        aufraeumen: { filter: "none" },
    },
    zeilen: {
        name: "Überschrift zeilenweise",
        beschreibung: "Die Überschrift wird in Zeilen zerlegt, jede Zeile steigt einzeln auf.",
        eignung: "In MASTER.md ausdrücklich als Motion-Baustein genannt. Für H1 und H2, nie für Fließtext.",
        von: { opacity: 0, y: 32 },
        nach: { opacity: 1, y: 0 },
        dauer: 1.0,
        ease: "power3.out",
        split: "lines",
        stagger: 0.13,
    },
    woerter: {
        name: "Überschrift wortweise",
        beschreibung: "Wie oben, nur feiner zerlegt — Wort für Wort.",
        eignung: "Lebendiger als zeilenweise, aber auch unruhiger. Nur für kurze Zeilen wie „Wir sind für Sie da.“",
        von: { opacity: 0, y: 20 },
        nach: { opacity: 1, y: 0 },
        dauer: 0.9,
        ease: "power2.out",
        split: "words",
        stagger: 0.06,
    },
    linie: {
        name: "Linie zeichnen",
        beschreibung: "Eine Linie wächst von links auf ihre volle Breite.",
        eignung: "Für Trennstriche unter Überschriften. Kleinste Geste im Katalog, fällt kaum auf und gibt trotzdem Rhythmus.",
        von: { scaleX: 0, transformOrigin: "left center", opacity: 1 },
        nach: { scaleX: 1, opacity: 1 },
        dauer: 1.0,
        ease: "power2.inOut",
    },
};
/** Reihenfolge im Motion-Labor: von ruhig nach kraeftig. */
export const PRESET_REIHENFOLGE = [
    "fade",
    "fade-up",
    "fade-weit",
    "fade-links",
    "fade-rechts",
    "linie",
    "clip-seite",
    "clip-hoch",
    "scale-sanft",
    "blur-in",
    "zeilen",
    "woerter",
];
/**
 * Auswahl an Kurven. Bounce und Elastic fehlen absichtlich - MASTER.md
 * schliesst sie aus.
 */
export const EASE_AUSWAHL = [
    { wert: "sine.out", name: "sine.out — am gleichmäßigsten" },
    { wert: "power1.out", name: "power1.out — sehr sanft" },
    { wert: "power2.out", name: "power2.out — Standard der Seite" },
    { wert: "power3.out", name: "power3.out — kräftiger Abbremser" },
    { wert: "expo.out", name: "expo.out — schnell rein, langes Ausrollen" },
];
