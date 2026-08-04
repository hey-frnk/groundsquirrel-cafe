# Checkout einrichten

Die Website bleibt ein statischer Export auf GitHub Pages. Nur *ein* winziger
Cloudflare Worker läuft serverseitig — er erzeugt die Stripe-Checkout-Session,
weil dafür der geheime Stripe-Schlüssel nötig ist, der niemals in den Browser
gehört.

```
Besucher → thegroundsquirrel.cafe (GitHub Pages, statisch)
             │  Warenkorb im Browser
             ▼
          gsc-checkout (Cloudflare Worker)  ── geheimer Schlüssel liegt hier
             ▼
          Stripe Checkout  ── Adresse, Versand, Zahlung, Beleg-Mail
             ▼
          /shop/thank-you/
```

**Warum der Warenkorb nicht manipulierbar ist:** Der Browser schickt nur
Stripe-Price-IDs und Stückzahlen. Den Betrag schlägt Stripe selbst anhand
dieser IDs nach. Wer im Browser „price: 1" hineinschreibt, ändert am
tatsächlich belasteten Preis nichts.

---

## Schritt 1 — Stripe-Konto (macht ihr)

Ein **eigenes Konto für das Café**, nicht das VFDCollective-Uhrenkonto. Unter
einem bestehenden Stripe-Login lässt sich über den Konto-Umschalter oben links
ein zweites Konto anlegen.

Warum getrennt: Der Text auf der Kreditkartenabrechnung des Kunden kommt vom
Konto. „VFDCOLLECTIVE" bei einem Poster-Kauf löst Rückbuchungen aus. Ausserdem
prüft Stripe, ob Geschäftszweck und Website zusammenpassen.

Einzurichten:

- Geschäftsangaben und Bankverbindung
- **Statement Descriptor** → z.B. `GROUNDSQUIRREL` (Einstellungen → Geschäftsdaten)
- Zahlungsarten aktivieren: Karten, TWINT, Apple Pay, Google Pay
- Beleg-Mails aktivieren (Einstellungen → E-Mails → *Erfolgreiche Zahlungen*)

## Schritt 2 — Produkte und Preise anlegen (macht ihr)

Im Stripe-Dashboard unter **Produktkatalog** für *jede* Variante einen Preis
anlegen. Es sind 13 Stück:

| Produkt | Variante | Preis |
|---|---|---|
| Squirrel Posters | Set (5 Blätter) | CHF 110.00 |
| Squirrel Posters | Eurasian Red Squirrel | CHF 25.00 |
| Squirrel Posters | Eastern Grey Squirrel | CHF 25.00 |
| Squirrel Posters | Golden-mantled Ground Squirrel | CHF 25.00 |
| Squirrel Posters | African Tree Squirrel | CHF 25.00 |
| Squirrel Posters | California Ground Squirrel | CHF 25.00 |
| Squirrel Stickers | Set (6 Designs) | CHF 12.00 |
| Squirrel Stickers | European Squirrel | CHF 4.00 |
| Squirrel Stickers | Eastern Gray Squirrel | CHF 4.00 |
| Squirrel Stickers | Golden-mantled Ground Squirrel | CHF 4.00 |
| Squirrel Stickers | African Tree Squirrel | CHF 4.00 |
| Squirrel Stickers | Alpine Marmot | CHF 4.00 |
| Squirrel Stickers | California Ground Squirrel | CHF 4.00 |

Jeder Preis bekommt eine ID der Form `price_1AbC...`. Diese ID gehört ins CMS in
das Feld **Stripe Price ID** der jeweiligen Variante (Shop → Produkt →
Varianten). Solange ein Feld leer ist, zeigt der Warenkorb „Checkout opens
soon" — der Shop lässt sich also gefahrlos schon veröffentlichen.

## Schritt 3 — Versandtarife (macht ihr)

Unter **Einstellungen → Versand → Versandtarife** je Zone einen Tarif anlegen,
z.B.:

- Schweiz — CHF 7.00
- Europa — CHF 12.00
- Weltweit — CHF 18.00

Die IDs (`shr_...`) kommen in `wrangler.toml` unter `SHIPPING_RATES`,
kommagetrennt, günstigster zuerst.

> Ob ihr MwSt. ausweisen müsst, hängt von Umsatz und Zielländern ab — das
> gehört vor dem ersten Verkauf einmal zum Treuhänder. `automatic_tax` ist im
> Worker eingeschaltet; falls ihr noch nicht steuerpflichtig seid, in
> `src/index.js` auf `"false"` setzen.

## Schritt 4 — Worker deployen

```bash
cd checkout-worker
npx wrangler login
npx wrangler secret put STRIPE_SECRET_KEY   # sk_live_... hier einfügen
npx wrangler deploy
```

`wrangler deploy` gibt eine URL aus, etwa
`https://gsc-checkout.<euer-name>.workers.dev`.

> Der geheime Schlüssel wird nur hier eingegeben und landet nie im Repository.
> Er darf niemals in `wrangler.toml`, in `.env` oder in einem Commit stehen.

## Schritt 5 — Website mit dem Worker verbinden

Die Worker-URL als Repository-Variable hinterlegen — GitHub → Settings →
Secrets and variables → Actions → **Variables** → New variable:

- Name: `NEXT_PUBLIC_CHECKOUT_URL`
- Wert: die URL aus Schritt 4

Danach einmal deployen (Actions → *Deploy to GitHub Pages* → Run workflow).
Ab dann steht im Warenkorb „Checkout" statt „Checkout opens soon".

## Schritt 6 — Testlauf vor dem Scharfschalten

Mit dem **Testmodus-Schlüssel** (`sk_test_...`) und Test-Price-IDs einmal
durchspielen. Stripe-Testkarte: `4242 4242 4242 4242`, beliebiges künftiges
Ablaufdatum, beliebige CVC.

Zu prüfen:

- [ ] Adressabfrage erscheint und akzeptiert eine Schweizer Adresse
- [ ] Versandtarif wird passend zum Land gewählt
- [ ] Nach der Zahlung landet man auf `/shop/thank-you/`
- [ ] Der Warenkorb ist danach leer
- [ ] Die Beleg-E-Mail kommt an
- [ ] Die Bestellung erscheint im Stripe-Dashboard unter *Zahlungen*

Erst danach auf die Live-Schlüssel und Live-Price-IDs wechseln.

## Danach: Bestellungen ausführen

Stripe wickelt Zahlung, Adresse und Belege ab — es sagt aber der Druckerei
nichts. Nach jeder Bestellung muss der Auftrag bei Prodigi ausgelöst werden.
Am Anfang von Hand (Stripe-Bestellung ansehen → bei Prodigi bestellen). Wenn
das Volumen steigt, lässt sich das über einen Stripe-Webhook automatisieren —
dafür bitte melden, das ist ein eigener Ausbauschritt.

## Kosten

| Posten | Kosten |
|---|---|
| GitHub Pages | gratis |
| Cloudflare Worker | gratis bis 100'000 Anfragen/Tag |
| Stripe Grundgebühr | keine |
| Stripe pro Verkauf | ~2.9% + CHF 0.30 |
