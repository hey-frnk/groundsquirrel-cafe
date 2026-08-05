# the ground squirrel café — Website

Hallo Evelyne & Frank! 👋 Hier ist eure neue, komplett gratis Website. Diese Datei erklärt in einfachen Worten, was gebaut wurde, wie ihr sie lokal anschauen könnt, und was noch zu tun ist, bevor sie online geht.

## Was das hier ist

Eine Next.js-Website (React + TypeScript + Tailwind CSS), die als reine HTML/CSS/JS-Dateien "exportiert" wird ("static export") und dadurch komplett gratis auf **GitHub Pages** gehostet werden kann. Inhalte (Journal-Posts, Shop-Produkte, Crew-Bios, Tour-Stopps, Studio-Inhalte, Impressum/Datenschutz) liegen als einfache Textdateien (Markdown) im Ordner `content/`. Über das eingebaute **Decap CMS** (`/admin`) könnt ihr diese Dateien später bequem über eine Login-Oberfläche bearbeiten, ohne Code anzufassen.

## Lokal ausprobieren

```bash
npm install
npm run dev
```

Dann im Browser `http://localhost:3000` öffnen. Jede Änderung an einer Datei wird sofort sichtbar.

Für eine Vorschau der finalen, statisch exportierten Version:

```bash
npm run build
npx serve out
```

## Struktur — wo ist was?

- `src/app/` — die Seiten (Next.js "App Router"): `page.tsx` = Home, `tour/`, `journal/`, `studio/`, `shop/`, `crew/`, `impressum/`, `datenschutz/`
- `src/components/` — wiederverwendbare Bausteine (Header, Footer)
- `content/` — **alle Texte/Inhalte** als Markdown-Dateien, unterteilt nach Bereich (journal, shop, crew, tour-stops, studio-*, pages)
- `public/images/` — alle Bilder
- `public/admin/` — das CMS (Decap CMS)
- `scripts/build-studio-images.sh` — macht aus den Originalen in `res/` die Web-Versionen der Studio-Bilder
- `.github/workflows/deploy.yml` — automatischer Build + Deploy bei jedem Push auf `main`

## ⚠️ Was noch fehlt, bevor die Seite online geht

Ich habe an vielen Stellen bewusst **Platzhalter** eingebaut, statt Dinge zu erfinden, die ich nicht wissen kann. Alles mit `[PLATZHALTER: ...]` im Text muss noch ersetzt werden — entweder direkt in den Dateien in `content/`, oder später bequem über das CMS:

| Bereich | Was fehlt |
|---|---|
| **Tour** | Echte Stopps (Orte, Daten, Fotos, Beschreibungen) — aktuell 2 Beispiel-Einträge |
| **Studio** | Unterrichtsmaterial + echter Eduki-Link |
| **Shop** | Echte Produkte, Preise, Fotos, Stripe Payment Links |
| **Crew** | Text + Foto für Humbär und Bumblepuutz |
| **Footer** | Instagram-, YouTube-, TikTok-Links (aktuell ausgeblendet, da leer) |
| **Impressum & Datenschutz** | **Wichtig:** echte rechtliche Angaben (Name, Adresse, verantwortliche Person). Das ist keine Rechtsberatung — bitte kurz prüfen (lassen), ob alles für euren Kanton stimmt |
| **Kontakt-E-Mail** | Ich habe `hello@thegroundsquirrel.cafe` als Platzhalter für die öffentlich sichtbare Kontakt-Adresse eingesetzt (statt eurer privaten E-Mail) — bitte in `content/pages/settings.md` durch die gewünschte Adresse ersetzen |

## Entscheidungen, die ich getroffen habe (bitte kurz gegenchecken)

- **Journal-Blogposts:** Die 3 alten Blogposts waren zweisprachig (Englisch + Deutsch, Absatz für Absatz). Da die neue Seite laut Vorgabe komplett englisch sein soll, habe ich nur die englischen Absätze übernommen und die deutschen weggelassen. Sagt Bescheid, falls ihr die deutschen Versionen doch irgendwo behalten wollt.
- **Fotos in den Blogposts:** Ich habe versucht, alle Fotos aus dem Archiv zu übernehmen (teils direkt von Squarespace heruntergeladen, teils aus euren lokalen Archivdateien kopiert). Die exakte Reihenfolge/Zuordnung von Bildunterschriften ist bei sehr vielen Bildern nicht zu 100% pixelgenau wie im Original, aber inhaltlich vollständig.
- **Frank & Evelyne Crew-Bios:** 1:1 aus eurer alten "About Us"-Seite (weltenhummler) übernommen und übersetzt/angepasst, wo nötig.
- **Schrift:** Special Elite wird komplett durchgehend verwendet (Überschriften, Fliesstext, Buttons) wie gewünscht, mit grosszügigem Letter-Spacing.
- **Studio-Bilder sind bewusst klein:** Die Originale in `res/` sind Druckauflösung. Ins Web geht nur eine verkleinerte Fassung (lange Kante max. 1000–1200 px, Metadaten entfernt), erzeugt mit `./scripts/build-studio-images.sh` — gross genug, dass alles hübsch aussieht, zu klein für einen brauchbaren Nachdruck. Dazu sind Ziehen aufs Desktop und das Rechtsklick-Menü auf den Bildern abgeschaltet. Das ist Reibung, kein Schloss: Wer will, kommt an jedes Bild im Netz heran — der wirksame Schutz ist die Auflösung.
- **Studio-Logo:** Der gemalte Schriftzug ist die Überschrift der Studio-Seite (`alt`-Text «the ground squirrel studio»), damit Vorleseprogramme und Suchmaschinen den Studionamen lesen statt «Bild».

## Nächste Schritte: Auf GitHub veröffentlichen

### 1. Repository erstellen

Auf [github.com/new](https://github.com/new) ein neues, **öffentliches** Repository erstellen (z.B. `groundsquirrel-cafe`). GitHub Pages braucht bei privaten Repos ein bezahltes Konto — bei öffentlichen Repos ist es gratis.

### 2. Code hochladen

Sagt mir einfach Bescheid, sobald das Repo existiert (Name/Link genügt) — dann übernehme ich das Pushen für euch. Falls ihr es selbst machen wollt:

```bash
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/EUER-USERNAME/EUER-REPO.git
git push -u origin main
```

### 3. GitHub Pages aktivieren

Im Repo unter **Settings → Pages**: bei "Build and deployment" die Option **"GitHub Actions"** auswählen (nicht "Deploy from branch"). Der Workflow in `.github/workflows/deploy.yml` übernimmt danach automatisch den Build bei jedem Push.

### 4. Eigene Domain (thegroundsquirrel.cafe) verbinden

Die Datei `public/CNAME` ist bereits mit `thegroundsquirrel.cafe` vorbereitet. Bei eurem Domain-Anbieter (wo ihr die Domain gekauft habt) müsst ihr folgende DNS-Einträge setzen:

- `A`-Einträge für `@` auf die vier GitHub-Pages-IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME`-Eintrag für `www` auf `EUER-USERNAME.github.io`

(GitHub hat dazu auch eine [offizielle Anleitung](https://docs.github.com/de/pages/configuring-a-custom-domain-for-your-github-pages-site).)

### 5. Decap CMS einrichten (damit ihr Inhalte bequem bearbeiten könnt)

Das CMS unter `/admin` braucht eine kleine, ebenfalls gratis "Anmelde-Brücke" (OAuth), da GitHub Pages selbst keine Logins verarbeiten kann. Der einfachste Weg:

1. Ein gratis Konto auf [netlify.com](https://netlify.com) erstellen (nur für diesen einen Zweck, **nicht** um die Seite dort zu hosten).
2. Dieses Repo verwenden: [decaporg/decap-cms-oauth-provider](https://github.com/decaporg/decap-cms-oauth-provider) — dort steht ein "Deploy to Netlify"-Button.
3. Nach dem Deploy erhaltet ihr eine URL wie `https://euer-name.netlify.app`.
4. In `public/admin/config.yml` die Zeile `base_url:` durch genau diese URL ersetzen, und `repo: OWNER/REPO_NAME` durch euren echten GitHub-Pfad (z.B. `evelyne/groundsquirrel-cafe`).
5. In den GitHub-Einstellungen unter **Settings → Developer settings → OAuth Apps** eine neue OAuth-App registrieren, die auf eure Netlify-OAuth-URL zeigt (genaue Felder stehen in der Anleitung des obigen Repos).

Das klingt nach mehr Schritten als es ist — meldet euch gerne, dann helfe ich beim Einrichten Schritt für Schritt live mit.

**Bis dahin funktioniert alles auch ganz ohne CMS:** Ihr (oder ich) könnt jede Markdown-Datei in `content/` direkt auf GitHub.com im Browser bearbeiten (Stift-Symbol bei jeder Datei) — bei jedem Speichern wird die Seite automatisch neu gebaut und aktualisiert sich innerhalb von 1-2 Minuten.

### 6. Shop: Stripe Payment Links erstellen

Für jedes Produkt, das ihr verkaufen wollt:

1. Gratis-Konto auf [stripe.com](https://stripe.com) erstellen.
2. Im Stripe-Dashboard unter **Payment Links** einen neuen Link pro Produkt erstellen (Produktname, Preis, Foto).
3. Den generierten Link ins Feld **"Stripe Payment Link"** beim jeweiligen Produkt in `content/shop/` (oder später im CMS) einfügen — der "Jetzt kaufen"-Button erscheint dann automatisch.

## Zusammenfassung: Was ist gratis, was kostet was?

- **Hosting (GitHub Pages):** komplett gratis
- **Domain:** die habt ihr ja schon
- **CMS (Decap):** gratis, nur die kleine Netlify-Anmeldebrücke braucht ein (gratis) Netlify-Konto
- **Shop-Checkout (Stripe):** gratis einzurichten, Stripe nimmt nur eine kleine Gebühr pro Verkauf (ca. 1.5–2.9% + Fixbetrag, siehe stripe.com/pricing)
- **Kontaktformular:** bewusst weggelassen — Kontakt läuft über einen einfachen "E-Mail schreiben"-Link (mailto), wie besprochen
