/**
 * Pfade, die nur automatische Schwachstellen-Scanner aufrufen: versteckte
 * Dateien und Ordner wie /.git/HEAD, /.svn/entries, /.env (außer
 * /.well-known) sowie WordPress- und PHP-Adressen. Auf einer Next-Website gibt
 * es nichts davon. Der Proxy weist sie mit einer leeren 404 ab, und die
 * Reichweitenmessung zählt sie nicht als Besuch.
 *
 * Die Vercel-Firewall (Regel „Scanner-Pfade sperren“) sperrt dieselben
 * Pfade schon vorher; das hier ist die zweite Absicherung, falls die Regel
 * fehlt oder die Seite woanders läuft.
 */
export function istScannerPfad(pfad: string): boolean {
  const p = pfad.toLowerCase();
  if (/(^|\/)\.(?!well-known(\/|$))/.test(p)) return true;
  return /^\/(wp-|wordpress|xmlrpc|phpmyadmin|cgi-bin)|\.php\d?(\/|$)/.test(p);
}
