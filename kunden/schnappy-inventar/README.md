# Schnappy – neue Ware per CSV

1. **Fotos** in `~/Desktop/Schnappy-Inventar/Fotos` legen: pro Artikel Vorderseite (heller Hintergrund) und Rückseite (Barcode, Inhalt, Hersteller).
2. **Claude** schreibt Titel, Beschreibung, Kategorie, Tags, Grundpreis und Warnhinweise in `produkte.json`. Preis, Menge und UVP kommen vom Kunden.
3. `node kunden/schnappy-inventar/csv.js` erstellt `import.csv` und quadratische Bilder in `bilder/` (1600 px, weißer Rand). Danach committen und pushen, damit die Bild-URLs erreichbar sind.
4. **Shopify-Admin** → Produkte → Importieren → `import.csv`. Bei Änderungen an bestehenden Artikeln „Vorhandene Produkte mit gleichem Handle überschreiben“ anhaken.

## Felder in `produkte.json`
| Feld | Pflicht | Hinweis |
|---|---|---|
| `titel` | ja | kurz und klar, z. B. „Happy Socks 3er-Pack, Smiley, Gr. 36–40“ |
| `preis` | ja | Verkaufspreis in € |
| `menge` | ja | Bestand |
| `uvp` | nein | nur echte UVP oder echter eigener Vorpreis (§ 11 PAngV) |
| `beschreibung` | nein | HTML; Hersteller und Warnhinweise (GPSR, Spielzeug) hier eintragen |
| `marke`, `typ`, `tags` | nein | `typ` = Kategorie (Spielzeug, Küche & Haushalt, Wohnen, Elektronik …), Tag `alter-3` = „Empfohlen ab 3 Jahren“ |
| `ean`, `gramm` | nein | Barcode, Versandgewicht |
| `grundpreis` | bei Gewicht/Volumen | z. B. `{ "menge": 150, "einheit": "g", "basis": 100 }` |
| `fotos` | nein | Dateinamen aus dem Foto-Ordner, erstes Foto = Hauptbild |
| `status` | nein | `"draft"` = erst als Entwurf anlegen |

## Bilder
Nur eigene Fotos oder Bilder mit schriftlicher Erlaubnis von Lieferant oder Hersteller verwenden. Produktfotos aus Google, Amazon oder fremden Shops sind urheberrechtlich geschützt (§ 72 UrhG).
