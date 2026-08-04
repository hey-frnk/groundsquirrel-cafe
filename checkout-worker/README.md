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

## Schritt 2 — Produkte und Preise anlegen

Das erledigt ein Skript, damit ihr 13 Preise nicht von Hand klickt. Es liest
die Varianten direkt aus `content/shop/`, legt sie in Stripe an und trägt die
zurückgegebenen Price-IDs wieder in die Dateien ein.

```bash
export STRIPE_SECRET_KEY=sk_test_...
node scripts/setup-stripe.mjs --dry-run   # erst anschauen
node scripts/setup-stripe.mjs             # dann wirklich anlegen
```

Der Schlüssel wird aus der Umgebung gelesen, nicht als Argument übergeben —
so landet er nicht in der Shell-History. Mehrfaches Ausführen ist unschädlich:
Produkte bekommen eine feste ID aus der SKU, Preise die SKU als `lookup_key`,
also wird beim zweiten Lauf wiederverwendet statt dupliziert. Ändert ihr einen
Preis im CMS und lasst das Skript erneut laufen, wird ein neuer Preis angelegt
und der alte archiviert (Stripe-Preise sind unveränderlich).

> **Test- und Live-Modus sind getrennte Welten.** Mit `sk_test_` angelegte
> Preise existieren im Live-Modus nicht. Also: einmal mit dem Testschlüssel
> anlegen und Checkout durchspielen, danach mit dem Live-Schlüssel erneut
> laufen lassen und die Live-IDs committen.

> Die Produktbilder werden als URLs auf `thegroundsquirrel.cafe` gesetzt und
> erscheinen dann im Stripe-Checkout. Solange die Seite noch nicht deployt
> ist, mit `--no-images` laufen lassen.

Angelegt werden diese 13 Einträge:

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

Jeder Preis bekommt eine ID der Form `price_1AbC...`. Das Skript trägt sie
selbst ein; wer lieber im Dashboard klickt, findet das Feld **Stripe Price ID**
im CMS unter Shop → Produkt → Varianten.

Solange ein Feld leer ist, zeigt der Warenkorb „Checkout opens soon" — der Shop
lässt sich also gefahrlos veröffentlichen, bevor Stripe fertig eingerichtet ist.

> **Schlüssel-Hygiene:** Der geheime Schlüssel gehört nur in die Umgebung oder
> in `wrangler secret`. Nicht in Dateien, nicht in Commits, nicht in Chats.
> Falls einer doch irgendwo aufgetaucht ist: Dashboard → Entwickler →
> API-Schlüssel → **Roll key**. Dauert Sekunden und macht den alten wertlos.

## Schritt 3 — Versandtarife

Die Zonen stehen in [`content/shipping.json`](../content/shipping.json). **Tragt
dort zuerst eure echten Beträge ein** — die aktuellen Werte sind Platzhalter und
stammen *nicht* aus den Etsy-Unterlagen. Was Prodigi euch für den Versand
berechnet, wisst nur ihr.

```bash
export STRIPE_SECRET_KEY=sk_test_...
node scripts/setup-shipping.mjs           # zeigt nur an, ändert nichts
node scripts/setup-shipping.mjs --apply   # legt in Stripe an
```

Trockenlauf ist Absicht: ein falscher Versandbetrag kostet bei *jeder*
Bestellung Geld. Das Skript legt die Tarife an und schreibt die `shr_…`-IDs
selbst in `wrangler.toml`.

### Warum die Zone nicht Stripe allein überlassen wird

Stripe Checkout zeigt dem Kunden **alle** Versandoptionen, die die Session
enthält — unabhängig von seiner Lieferadresse. Gäbe man alle drei Zonen mit,
könnte ein Kunde in Australien die Schweizer Pauschale anklicken und ihr zahlt
die Differenz.

Deshalb wählt der Kunde das Land schon im Warenkorb, der Worker schlägt daraus
die Zone nach und gibt Stripe **genau einen** Tarif mit. Zusätzlich wird die
Länderauswahl im Stripe-Formular auf dieses eine Land gesperrt, damit Tarif und
Adresse nicht auseinanderlaufen können.

Wenn ihr Zonen ändert, müssen `content/shipping.json` und die Länderliste in
[`src/lib/countries.ts`](../src/lib/countries.ts) zusammenpassen — jedes Land im
Dropdown braucht eine Zone.

> Ob ihr MwSt. ausweisen müsst, hängt von Umsatz und Zielländern ab — das
> gehört vor dem ersten Verkauf einmal zum Treuhänder. `automatic_tax` ist im
> Worker eingeschaltet; falls ihr noch nicht steuerpflichtig seid, in
> `src/index.js` auf `"false"` setzen und `taxBehavior` in `shipping.json` auf
> `"unspecified"`.

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
