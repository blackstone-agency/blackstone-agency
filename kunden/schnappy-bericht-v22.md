# Schnappy – Live-Analyse & Theme v22 · 29.10.2026

> **Kein Rechtsrat.** Dieser Check ist eine technische Orientierungshilfe und ersetzt
> keine anwaltliche Beratung. Die rechtlichen Prüfpunkte (Impressum, Datenschutz,
> Cookie-Consent, BFSG usw.) sind Hinweise auf mögliche Handlungsfelder, keine
> rechtsverbindliche Bewertung. Für eine belastbare Einschätzung – besonders bei
> Abmahnrisiken, Shops und der Barrierefreiheitspflicht – bitte einen Fachanwalt für
> IT-/Medienrecht hinzuziehen. Rechtslage: Stand der Prüfung, ohne Gewähr.

## Das Wichtigste
- **Live läuft noch v20.** v21 wurde nie veröffentlicht. v22 enthält v21 + alle Fixes unten.
- **Download:** [schnappy-theme-v22.zip](https://github.com/blackstone-agency/blackstone-agency/raw/main/kunden/schnappy-theme-v22.zip)
- Geprüft: 25 Seiten × 360 / 390 / 1280 / 1440 px (100 Aufrufe), Menü, Suche, Filter, Ansichten, Merkzettel, Warenkorb, Rabattcode, Rückgängig, Pop-up, Nächster Fund. Nichts bestellt, nichts im Admin geändert.
- Kein horizontales Scrollen, keine kaputten Bilder, Cookie-Banner mit gleichwertigem „Ablehnen“.
- Screenshots: Ordner [`schnappy-audit-2026-10-29/`](schnappy-audit-2026-10-29/)

## 🔴 Kritisch

| # | Seite · Gerät | Problem | Ursache | Lösung | Status |
|---|---|---|---|---|---|
| 1 | /pages/widerruf, faq, versand, live, ueber-uns, merkzettel · alle | **404** – auch der Pflicht-Link „Vertrag widerrufen“ (§ 356a BGB) · Bild 01 | Seiten nie im Admin angelegt | Theme leitet fehlende Seiten auf `/pages/contact?view=…` um (live getestet, Formular funktioniert) | ✅ v22 + 🛠 A2 |
| 2 | Impressum · alle | Platzhalter „[USt-IdNr. eintragen – Zeile löschen …]“ sichtbar · Bild 02 | Richtlinientext | USt-IdNr. eintragen oder Zeile löschen | 🛠 A3 |
| 3 | Mystery Boxen · alle | Namen vertauscht: 29,99 €-Box heißt „XXL Super Mystery Box“, 9,99 €-Box „Mystery Box M“, im Box-Abschnitt kostet „XXL“ 99 € · Bild 05 | Produkttitel im Admin | Titel korrigieren | 🛠 A5 |
| 4 | Fast alle Seiten · alle | Preisformat „€65,99“ statt „65,99 €“ (Streichpreis, „Du sparst“, Warenkorb, Kasse-Button, Suche, Tab-Leiste) · Bilder 03, 04, 13 | Währungsformat im Admin + `money`-Filter | Theme gibt überall „65,99 €“ aus; Admin-Format für Kasse/E-Mails anpassen | ✅ v22 + 🛠 A4 |
| 5 | Warenkorb · Handy + Desktop | Artikelbereich zu klein (Handy ~360 px, Desktop ~325 px) | Lieferung, SSL, Klarna, Zahlarten, „Weiter einkaufen“ waren unten fest | Nur Summe + Kasse fest, Rest scrollt mit; kompaktere Zeilen → **542 px / 495 px** · Bild 16 | ✅ v22 |
| 6 | Hinweis „Geschnappt!“ · Handy | „Zur Kasse“ ragt aus dem Kasten, Text in 3 Zeilen · Bild 07 | Buttons durften nicht schrumpfen | Text oben, Buttons darunter je halbe Breite | ✅ v22 |
| 7 | Warenkorb „Passt noch dazu“ · Handy + Desktop | Vorschläge laufen rechts aus der Schublade (bis 1161 px bei 390 px Breite) · Bild 17 | Grid ohne `minmax(0,1fr)` | Liste auf Schubladenbreite begrenzt | ✅ v22 |
| 8 | „Nächster Fund“ / „Überrasch mich“ · alle | JS-Fehler `ls is not defined` bei jedem Klick | Codeblock doppelt, eine Kopie im falschen Modul | Doppelten Block entfernt | ✅ v22 |

## 🟡 Wichtig

| # | Seite · Gerät | Problem | Ursache | Lösung | Status |
|---|---|---|---|---|---|
| 9 | Kategorien · alle | „Elektronik“ 0 Treffer, „Wohnen“ 1, „Angebote“ 4, „Mystery Boxen“ 10 statt 3 · Bild 09 | Kacheln suchen nach dem Namen, Produkte haben keinen Typ/Tags | Neues Feld „Suchbegriff oder Pfad“: Mystery Boxen → genau die 3 Boxen, Elektronik → 9, Wohnen → 17, Angebote/Neu → Alle Produkte sortiert | ✅ v22 + 🛠 A6 |
| 10 | Produktseite · alle | Streichpreis ohne „statt“/„UVP“ (§ 11 PAngV) | Kennzeichnung nur auf Karten | Auch auf der Produktseite | ✅ v22 + 🛠 A8 |
| 11 | Produktseite · alle | Doppelte Steuerzeile („Inkl. Steuern …“ + „inkl. MwSt., zzgl. Versand“) | Dawn-Standard + eigene Zeile | Eine Zeile „inkl. MwSt., zzgl. Versand“ | ✅ v22 |
| 12 | Newsletter-Pop-up · Handy | Öffnet nach 20 s **unter** dem Cookie-Banner · Bild 12 | Keine Rücksicht auf den Banner | Wartet, bis der Banner weg ist | ✅ v22 |
| 13 | Startseite · Handy | „Teilen“ im Schnapper des Tages abgeschnitten · Bild 08 | Buttons ohne Umbruch | Buttons brechen um | ✅ v22 |
| 14 | Mystery-Box-Seite · alle | Leere Lücke über „Noch mehr Schnäppchen“ · Bild 10 | Leere Empfehlungen behalten Abstand | Lücke entfernt | ✅ v22 |
| 15 | Mystery Box M · alle | „BESTSELLER“ + „Unser Bestseller“ ohne Verkaufsdaten | Startseiten-Text | „EMPFEHLUNG“ / „Unsere Empfehlung“ | ✅ v22 |
| 16 | Play-Doh (B-Ware) · alle | „Neuware, geprüft“ steht auch bei B-Ware | Fester Text | Bei „B-Ware“ im Titel/Tag: „Geprüfte B-Ware, voll funktionsfähig“ | ✅ v22 |
| 17 | Glibbi 150 g, Badebomben 3×30 g, Play-Doh 16×112 g | Kein Grundpreis (§ 4 PAngV) | Einheitspreis nicht gepflegt | Grundpreis je Variante eintragen (Theme zeigt ihn an) | 🛠 A9 |
| 18 | Produktbilder Mystery Boxen · alle | Bilder sind Screenshots einer Tabelle mit Mini-Schrift · Bild 06 | Produktbilder | Echte Box-Fotos (liegen in `kunden/schnappy-boxbilder/`) | 🛠 A5 |
| 19 | Alle Produkte · alle | Standard-Sortierung „Alphabetisch A–Z“ · Bild 14 | Shopify-Standard | Kacheln/Links führen jetzt auf sortierte Ansichten | ✅ teilw. |
| 20 | Startseite / Suche · Handy | Ladezeit 5–7 s, ~2 MB, LCP ~3 s | ~1,9 MB davon lädt Shopify für den Checkout vor (nicht abschaltbar), dazu einige 250-KB-Produktbilder | Bilder kleiner hochladen (max. 1200 px, < 150 KB) | 🛠 |

## 🟢 Feinschliff
- Fußzeile Desktop: E-Mail brach mitten im Wort um („support@schnappy.s hop“) → ✅ v22 · Bild 11
- „Noch mehr Schnäppchen unter 31 €“ → runde Grenze (30 € / 35 €) → ✅ v22
- Startseite hatte zwei `<h1>` (Logo + Hero) → ✅ v22
- Lieferhinweis „bis 14 Uhr bestellt = Versand heute“ nur stehen lassen, wenn das sicher klappt (Feiertage werden nicht berücksichtigt)
- „Warenwert mind. 50 €“ (Box M) nur, wenn garantiert
- Hero-Kachel „Ab 9,99 €“ bricht bei 360 px das „€“ um
- Warenkorb zeigt Preis je Zeile doppelt (unter dem Titel und rechts)

## 🛠 Was du in Shopify einstellen musst

**A1 · v22 hochladen** – Onlineshop → Themes → Theme hinzufügen → ZIP-Datei hochladen → `schnappy-theme-v22.zip` → Vorschau prüfen → Veröffentlichen. Danach ggf. Theme-Editor-Einstellungen aus v20 übernehmen (Logo, Schnappy Einstellungen).

**A2 · Info-Seiten anlegen** (v22 fängt das ab, für Google sind echte Seiten besser) – Onlineshop → Seiten → Seite hinzufügen → Titel → rechts „Vorlage“ wählen → Speichern. Adresse prüfen unter „Suchmaschinen-Eintrag bearbeiten“:
`faq` · `live` · `ueber-uns` · `versand` · `widerruf` (Vorlage widerruf) · `merkzettel`

**A3 · Impressum** – Einstellungen → Richtlinien → Impressum → Platzhalter durch USt-IdNr. ersetzen oder Zeile löschen → Speichern.

**A4 · Währungsformat** (für Kasse, E-Mails, PayPal/Klarna) – Einstellungen → Allgemein → Shop-Standards → Währung → „Formatierung ändern“:
- HTML/E-Mail **ohne** Währung: `{{amount_with_comma_separator}} €`
- HTML/E-Mail **mit** Währung: `{{amount_with_comma_separator}} € EUR`

**A5 · Mystery Boxen** – Produkte → je Box öffnen → Titel: `mystery-box-s` (9,99 €) = „Mystery Box S“, `mystery-box-m` (29,99 €) = „Mystery Box M“, `xxl-super-mystery-box` (99 €) = „XXL Super Mystery Box“. Bilder durch echte Box-Fotos ersetzen.

**A6 · Produkttyp pflegen** (bringt Kategorien, „Mehr aus …“-Reihen und „Nächster Fund“ zum Laufen) – Produkte → alle markieren → „Bearbeiten“ (Bulk-Editor) → Spalte „Produkttyp“: Spielzeug / Küche & Haushalt / Wohnen / Elektronik / Socken … Danach optional automatisierte Kollektionen (Produkte → Kollektionen → Kollektion erstellen → Automatisiert → „Produkttyp ist gleich …“; für Angebote: „Vergleichspreis ist größer als 0“) und im Theme-Editor die Kachel-Links auf die Kollektionen setzen.

**A7 · Newsletter Double-Opt-in** – Onlineshop → Präferenzen → E-Mail-Marketing → „Kunden müssen ihr Abonnement bestätigen“ aktivieren.

**A8 · Wort vor dem Streichpreis** – Theme anpassen → Fußzeile → Schnappy Einstellungen → „UVP“, wenn der Streichpreis der Herstellerpreis ist; „statt“ nur bei eurem eigenen niedrigsten Preis der letzten 30 Tage.

**A9 · Grundpreis** – Produkt → Variante → „Einheitspreis anzeigen“ → Gesamtmenge (z. B. 150 g) und Grundmenge (100 g) eintragen. Betrifft alle Artikel mit Gewichts-/Volumenangabe.

## Technik
- `shopify theme check --fail-level error`: **0 Fehler** (9 Warnungen in unveränderten Dawn-Dateien).
- CSS/JS v22 auf dem Live-Shop gegengeprüft (360/390/1280): kein Überlauf, nichts abgeschnitten, keine JS-Fehler.
- Liquid-Änderungen (Preisformat, Links, Warenkorb-Aufbau) wirken erst nach dem Hochladen von v22 – bitte nach A1 einmal Startseite, Produktseite und Warenkorb am Handy ansehen.
