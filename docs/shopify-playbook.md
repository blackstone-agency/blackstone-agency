# Shopify-Playbook – Blackstone Agency

Regeln aus dem Schnappy-Projekt (Okt. 2026). Ziel: Ein Shop klappt **beim ersten Hochladen**, und die Vorschau ist von Anfang an das echte Theme.

## 1. Grundsatz: Vorschau = echtes Theme
- **Nie** eine statische HTML-Demo bauen und später „nach Shopify übersetzen“. Das kostet doppelt und bricht.
- Von Tag 1 an ein **Online Store 2.0 Theme auf Basis von Dawn** (aktuelle Version) bauen: `layout/`, `sections/`, `snippets/`, `templates/*.json`, `config/`, `locales/`, `assets/`.
- Vorschau für den Kunden = **Theme-ZIP in Shopify hochladen → „Vorschau teilen“**. Das Theme nicht veröffentlichen, bis der Kunde freigibt.
- Kein Shopify-Zugang aus der Sandbox möglich (Proxy blockiert): Prüfen über `shopify theme check`, eigenen JSON-Prüfer und LiquidJS-Testumgebung mit Mock-Daten (siehe unten).

## 2. Harte Regeln, sonst lehnt Shopify das Theme ab oder es bricht
1. **`config/settings_schema.json` nie umbauen.** Original von Dawn lassen. Eigene Einstellungen gehören in **Abschnitte** (Section-Schema), z. B. einen unsichtbaren „Einstellungen“-Abschnitt in der Footer-Gruppe, der `window.CFG` ausgibt.
2. **`settings_data.json`:** `current` als Objekt plus gleiche Werte im Preset. Alle Farbschemata (`scheme-1` …) müssen existieren, sonst kommt der Editor-Fehler „Farbschemata …“.
3. **URL-Einstellungen:** Standardwerte dürfen keine externen Links und keine Anker (`/#x`) sein. Anker in Text-Einstellungen packen.
4. **Schema-Namen höchstens 25 Zeichen**, eindeutige Block-Typen, `select`-Werte müssen in den Optionen stehen, `range` mit gültigem min/max/step. Default-Werte für Richtext müssen mit `<p>` beginnen.
5. **Liquid:**
   - Kein `for x in 'a,b' | split`: erst `assign`, dann darüber loopen.
   - `paginate` maximal 50 pro Seite.
   - `collection.products` ohne paginate liefert max. 50.
   - `product.featured_image` statt erfundener Felder.
6. **Jede referenzierte Datei muss existieren.** Assets, Snippets und Sections; beim Löschen von Dateien auch alle Verweise (inkl. `password.liquid`) entfernen.
7. **Vor jedem ZIP:** `shopify theme check --fail-level error` muss **0 Fehler** zeigen.

## 3. Fallen von Dawn, die wir schon kennen
- `div:empty { display:none }` versteckt leere Deko-Divs: gezielt `display:block` setzen.
- **ID-Kollision:** Auf der Suchseite trägt der *Wrapper* die ID `#product-grid`, in der Kollektion die `<ul>`. CSS immer als `ul#product-grid` / `ul.product-grid` schreiben.
- **Karten stecken in `<product-component>`.** Das Element muss `flex:1; width:100%; min-width:0` bekommen, sonst sind Spalten ungleich breit.
- Dawn-Regeln mit hoher Spezifität (z. B. `.cart-drawer .cart-item { grid-template … }`) **mit stärkerem Selektor + `!important`** überschreiben, Kurzschreibweisen (`grid-template`) komplett ersetzen.
- **Asynchron geladene CSS** (z. B. predictive-search mit `media="print"`) erzeugt Ladekreisel beim ersten Laden. Synchron laden oder Spinner absichern.
- **Doppelt geladene Dawn-Skripte** (`predictive-search.js` ohne `customElements.get`-Schutz) erzeugen Fehler. Nur einmal einbinden.
- Der Dawn-Einkaufswagen und `product-form` hängen an festen IDs und Klassen (`#CartDrawer`, `cart-drawer-items`, `.drawer__inner`, `data-index`, `.loading__spinner`). Optik nur per CSS ändern, Struktur behalten.
- Kein Formular in einem anderen Formular (Upsell nicht in `#CartDrawer-Form`).

## 4. Von Anfang an einbauen (spart später 10 Runden)
- **Handy zuerst** (die meisten Kunden bestellen am Handy). Jede Seite bei 360 / 390 / 430 / 1024 / 1280 px prüfen, horizontales Scrollen = 0. Sicherheitsnetz: `main .shopify-section { overflow-x: clip }`.
- **Look:** heller Hintergrund, eckige Radien (4–8 px), Farben nur als Akzent, klare Button-Texte („In den Einkaufswagen“, keine Abkürzungen), 48-px-Tippflächen, Kontrast WCAG AA.
- **Produktkarten:** gleich breit und hoch, Titel 2 Zeilen, Preis plus „statt“-Streichpreis, Rabatt-Badge, voller Button.
- **Einkaufswagen:** Gratis-Versand-Balken, Ersparnis, Rabattcode-Feld (`/cart/update.js` mit `discount`), Gesamtsumme mit „inkl. MwSt.“, Kasse-Button mit Betrag.
- **Recht (DE):**
  - Impressum (§ 5 DDG), Datenschutz, AGB, Widerruf plus **Online-Widerrufsformular** (Pflicht seit 19.06.2026).
  - Streichpreise nur mit echtem Vorpreis.
  - Keine erfundenen Bewertungen oder Knappheit.
  - Grundpreis, Hinweis „inkl. MwSt. zzgl. Versand“.
  - GPSR-Angaben.
  - Versand-, Rückgabe- und Kontakt-Seiten als Vorlagen mitliefern.
- **Seitenvorlagen gleich mitbauen:** `page.faq`, `page.contact`, `page.versand`, `page.widerruf`, `page.ueber-uns`. In der Anleitung festhalten, welche Seiten der Kunde mit welchem Handle anlegen muss.
- **SEO:** Meta-Beschreibung als Fallback, OG-Bild, JSON-LD (Organization, Breadcrumb, FAQ), Alt-Texte, `noindex` bei Filterseiten.
- **Bilder:** quadratisch, heller Hintergrund, Hauptmotiv groß. Keine dunklen, kleinen Renderings.

## 5. Ablauf pro Shop
1. Kundendaten sammeln: Firma, Adresse, USt-IdNr., Kontakt, Social-Links, Versandkosten, Zahlarten, Logo-Dateien.
2. Dawn-Basis kopieren und eigene Sektionen `kunde-*` anlegen. Gemeinsame Snippets: Icons, Karten, Formulare.
3. Testumgebung: LiquidJS-Renderer mit Mock-Daten pro Vorlage (Startseite, Kollektion, Produkt, Suche, Seiten, Einkaufswagen) plus Playwright-Screenshots auf Handy und Desktop.
4. Prüfen: `theme check`, JSON-Validator, Screenshots, Überlauf-Check.
5. Lesbare Quellen getrennt halten, Assets minifizieren (csso ohne restructure, terser), ungenutztes CSS entfernen.
6. ZIP als `kunden/<shop>-theme-vN.zip` plus Download-Link. Der Kunde lädt hoch, teilt die Vorschau, veröffentlicht nach Freigabe.
7. Anleitung `ANLEITUNG.md` mitliefern: Seiten anlegen, Richtlinien einfügen, Einstellungen, Rabattcodes, Checkout-Branding, Versand/Steuern.
