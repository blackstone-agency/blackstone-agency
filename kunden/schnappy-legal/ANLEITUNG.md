# Schnappy – Shopify einrichten (Schritt für Schritt)

Stand: Oktober 2026 · Blackstone Agency

## 0. Zugang zum Shopify-Shop von Schnappy

Schnappy hat laut Kunde schon einen Shopify-Shop mit Ware.

1. Kostenlosen Partner-Account anlegen: partners.shopify.com
2. Im Partner-Dashboard: **Shops → Shop hinzufügen → Zugriff als Mitarbeiter anfordern** und die Shop-Adresse von Schnappy eintragen (z. B. `schnappy.myshopify.com`).
3. Schnappy bestätigt die Anfrage im eigenen Shopify-Admin (**Einstellungen → Benutzer → Mitarbeiter**). Hat der Kunde einen 4-stelligen Mitarbeiter-Anfragecode eingestellt, brauchst du den vorher.
4. Kein Passwort des Kunden nötig, und der Zugang lässt sich jederzeit wieder entziehen.

## 1. Theme hochladen (ohne den laufenden Shop zu ändern)

1. Shopify-Admin → **Onlineshop → Themes → Theme hinzufügen → ZIP-Datei hochladen** → `schnappy-theme.zip`.
2. Das Theme landet in der **Theme-Bibliothek** und ist noch NICHT live.
3. Bei diesem Theme auf **Anpassen** → hier stellst du alles ein (siehe Schritt 3).
4. **Vorschau teilen**: Bei dem Theme auf „…“ → **Vorschau teilen** → Link an den Kunden schicken.
5. Erst wenn alles passt: **Veröffentlichen**.

## 2. Rechtliches (Pflicht vor dem Livegang)

**Einstellungen → Richtlinien**:

| Shopify-Feld | Datei zum Einfügen |
|---|---|
| Rückerstattungsrichtlinie | `widerruf.html` |
| Datenschutzerklärung | `datenschutz.html` |
| Nutzungsbedingungen | `agb.html` |
| Versandrichtlinie | `versand.html` |
| Impressum (Rechtlicher Hinweis) | `impressum.html` |
| Kontaktinformationen | Firma, Adresse, Telefon, E-Mail eintragen |

So geht's: Im Textfeld oben auf das `<>`-Symbol (HTML-Ansicht) tippen und den Inhalt der Datei einfügen.

Zusätzlich:

- **Onlineshop → Seiten → Seite hinzufügen**: „Batterien & Elektrogeräte“ mit `entsorgung.html`, dann im Footer-Menü verlinken.
- **Einstellungen → Kundendatenschutz**: Cookie-Banner für EU aktivieren.
- **Impressum**: Die gelb markierte USt-IdNr. eintragen oder die Zeile löschen.
- **Widerrufs-Button (Pflicht seit 19.06.2026)**: Im Shop muss es einen gut sichtbaren Weg „Vertrag widerrufen“ geben, über den Kunden online widerrufen und eine Eingangsbestätigung erhalten. Lösung in Shopify:
  - Variante A: Seite „Vertrag widerrufen“ mit Kontaktformular anlegen (Felder: Name, E-Mail, Bestellnummer, Artikel) und im Footer verlinken.
  - Variante B: Eine Widerrufs-App aus dem Shopify App Store nutzen.

## 3. Startseite einstellen (Anpassen)

- **Logo**: Theme-Einstellungen → Logo → Original-Logo von Schnappy hochladen.
- **Mystery Boxen**: Im Abschnitt „Schnappy Mystery Boxen“ jeder Box das passende Produkt zuweisen. Preis, Streichpreis und Bestand kommen dann automatisch aus Shopify.
- **Schnapper der Woche**: Im Abschnitt „Ausgewählte Kollektion“ eine Kollektion wählen (z. B. „Schnapper der Woche“).
- **Live-Shows**: Wochentage und Uhrzeit für den Countdown einstellen.
- **Gratis-Versand-Balken**: Theme-Einstellungen → Schnappy → Betrag muss zu den Versandeinstellungen passen.

## 4. Produkte

Schnappy hat schon Ware im System, also nur prüfen:

- Jedes Produkt hat Titel, Fotos (quadratisch, heller Hintergrund), Preis und Bestand. Streichpreis nur angeben, wenn das ein echter vorheriger Preis bzw. eine echte UVP ist.
- **Kollektionen** anlegen: Mystery Boxen, Spielzeug, Trend, Elektronik, Haushalt, Schnapper der Woche. Am besten automatisiert über Produkt-Tags.
- Bei Elektronik mit Akkus/Batterien die Entsorgungshinweise beachten (siehe Rechtliches).

## 5. Zahlung & Versand

- **Einstellungen → Zahlungen**: Shopify Payments aktivieren (Karte, Apple Pay, Google Pay), PayPal verbinden, Klarna aktivieren.
- **Einstellungen → Versand**: Deutschland 4,90 €, ab 44 € kostenlos, Express 9,90 €.
- **Einstellungen → Steuern**: „Alle Preise enthalten Steuern“ aktivieren (19 % DE).

## 6. Vor dem Livegang: Pflicht-Checkliste

- [ ] **Verpackungsregister LUCID** (Zentrale Stelle Verpackungsregister): Wer Versandkartons an Endkunden schickt, muss registriert sein und an einem Dualen System teilnehmen. Gilt auch für kleine Shops.
- [ ] **ElektroG / Batterien**: Wer Elektrogeräte oder Batterien selbst aus Nicht-EU-Ländern importiert (z. B. China-Ware), gilt als Hersteller und braucht eine **WEEE-Reg.-Nr. (stiftung ear)** bzw. **Batterie-Registrierung**. Ohne Registrierung ist der Verkauf verboten.
- [ ] **Produktsicherheit (GPSR)**: Auf jedem Produkt bzw. in der Produktbeschreibung muss der Hersteller (bei Importware auch der EU-Verantwortliche) mit Kontaktdaten angegeben sein. Bei Spielzeug sind CE-Kennzeichen und Warnhinweise Pflicht.
- [ ] **Preisangaben**: Streichpreise nur mit echtem Bezug (UVP oder niedrigster Preis der letzten 30 Tage).
- [ ] Keine erfundenen Bewertungen oder Zahlen auf der Seite.
- [ ] Testbestellung durchführen (Shopify → Zahlungen → Testmodus).

**Hinweis:** Die Rechtstexte sind sorgfältig nach aktuellem Stand erstellt, ersetzen aber keine anwaltliche Prüfung. Für dauerhafte Abmahnsicherheit mit automatischen Updates empfiehlt sich ein Rechtstexte-Abo, z. B. IT-Recht Kanzlei, Händlerbund oder Protected Shops, ca. 10–30 € pro Monat, mit Shopify-Anbindung.

## 7. Theme v19 – einmalig einrichten (ca. 10 Minuten)

### Seiten anlegen
Shopify → **Onlineshop → Seiten → Seite hinzufügen**. Titel eintragen, rechts unter **Vorlage** die passende wählen, speichern. Die Adresse (Handle) muss genau so heißen:

| Titel | Vorlage | Adresse |
|---|---|---|
| Häufige Fragen | `faq` | `/pages/faq` |
| Live-Shows | `live` | `/pages/live` |
| Über uns | `ueber-uns` | `/pages/ueber-uns` |
| Versand & Lieferung | `versand` | `/pages/versand` |
| Vertrag widerrufen | `widerruf` | `/pages/widerruf` |
| Merkzettel | `merkzettel` | `/pages/merkzettel` |
| Kontakt | `contact` | `/pages/contact` (gibt es meist schon) |

### Einstellungen im Theme-Editor
**Anpassen → Fußzeile → „Schnappy Einstellungen“**:
- **Live-Tage und Uhrzeit** (z. B. `Mo,Mi,Fr` und `19:00`): Dann erscheint an diesen Tagen automatisch die rote Live-Leiste.
- **Willkommens-Code**: erst unter Rabatte in Shopify anlegen, dann hier eintragen.
- **Zweite Belohnung**: nur einschalten, wenn ihr ab dem Betrag wirklich etwas beilegt.
- **Newsletter-Pop-up**: an/aus, Verzögerung, Texte.

### Optional für noch mehr Wirkung
- **„Wird oft zusammen gekauft“**: App *Search & Discovery* → Produktempfehlungen → pro Produkt „Ergänzende Produkte“ eintragen. Ohne Eintrag zeigt der Shop ähnliche Produkte.
- **Produktsicherheit (GPSR)**: Einstellungen → Benutzerdefinierte Daten → Produkte → Metafeld `custom.produktsicherheit` (mehrzeiliger Text) anlegen und pro Produkt Hersteller/Warnhinweise eintragen. Erscheint automatisch als eigener Reiter.
- **Altersangabe**: Produkt-Tag `alter-3` → „Empfohlen ab 3 Jahren“.
- **Farb-Punkte**: Varianten-Option „Farbe“ mit Werten wie Rot, Blau, Schwarz.
- **Widerruf**: Shopify sendet das Formular an eure Shop-E-Mail. Bitte jedem Kunden den Eingang kurz per E-Mail bestätigen (gesetzlich vorgeschrieben).

## 8. Theme v22 (29.10.2026)
Live lief bis dahin noch v20. Alle Funde, Screenshots und die Klick-Anleitungen stehen in [`kunden/schnappy-bericht-v22.md`](../schnappy-bericht-v22.md) unter „Was du in Shopify einstellen musst“ (A1–A9). Wichtigste Punkte: v22 hochladen, Impressum-Platzhalter entfernen, Mystery-Box-Titel korrigieren, Währungsformat auf `{{amount_with_comma_separator}} €` stellen, Info-Seiten anlegen.
