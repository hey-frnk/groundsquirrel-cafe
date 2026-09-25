#!/usr/bin/env bash
#
# Builds the web versions of the journal photos from the originals in `res/`.
#
#   ./scripts/build-journal-images.sh
#
# Requires ImageMagick (`brew install imagemagick`). Only needs to run when an
# original changes — the generated files under public/images/journal/ are
# committed, because the site is a static export and never processes images at
# request time.
#
# Two recipes, because a journal post carries two kinds of picture:
#
#   photo     2000 px long edge, quality 72 — the same size the migrated
#             Squarespace photos already sit at, crisp at 2× in the article
#             column and on the pinboard.
#   diagram   1600 px long edge, quality 86 — a plan or a screenshot is mostly
#             flat colour and small type, which needs the higher quality to stay
#             readable but compresses to far less than a photograph.
#
# Only the posts whose originals live in `res/journal/` are listed here; the
# older posts came over from Squarespace already web-sized.
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="res/journal"
OUT="public/images/journal"

# fit <source> <destination> <long edge px> <quality>
fit() {
  local src="$1" dst="$2" edge="$3" quality="$4"
  mkdir -p "$(dirname "$dst")"
  magick "$src" \
    -auto-orient \
    -resize "${edge}x${edge}>" \
    -strip \
    -define webp:method=6 \
    -quality "$quality" \
    "$dst"
  printf '  %-58s %s\n' "$(basename "$dst")" "$(du -h "$dst" | cut -f1)"
}

echo "Humbär's electrics →"
HE="$SRC/humbaer-elektrik"
photo() { fit "$HE/$1" "$OUT/humbaer-electrics/$2.webp" 2000 72; }
diagram() { fit "$HE/$1" "$OUT/humbaer-electrics/$2.webp" 1600 86; }

photo   "interior-1.JPG"                 kitchen-by-the-lake
photo   "interior-2.JPG"                 espresso-and-a-cinnamon-bun
photo   "interior-3.JPG"                 living-room-with-a-mountain-view
photo   "interior-4.JPG"                 the-cafe-counter
photo   "bild-zentralelektrik.JPG"       evelyne-and-the-central-electrics
photo   "batterie-und-elektro-platte.JPG" frank-and-the-battery
photo   "elektro-platte-real.JPG"        the-board-as-built
photo   "elektro-platte-real-2.JPG"      the-board-under-the-bed
photo   "elektronik-von-hinten.JPG"      behind-the-curtain
photo   "solar-montage.JPG"              mounting-the-roof-rails
photo   "solar-montage-2.JPG"            laying-out-the-panels
photo   "solar-montage-3.JPG"            panels-on-the-frame
photo   "solar-montage-4.JPG"            panels-at-dusk
photo   "solar-messung.JPG"              measuring-the-panels
photo   "strom-von-der-sonne.JPG"        humbaer-in-the-snow
photo   "holzofen.JPG"                   the-wood-stove
diagram "verbraucher.png"                what-draws-power
diagram "elektro-platte.png"             the-board-on-paper
diagram "schaltplan.png"                 wiring-diagram
diagram "dachentwurf.png"                roof-plan
diagram "lampen-design.007.png"          lamp-design
diagram "mppt-screenshot.PNG"            the-solar-app
photo   "title.JPG"                      humbaer-at-golden-hour
photo   "bread-from-the-oven.JPG"        bread-from-the-oven
photo   "cloudy-day.JPG"                 a-gray-day-at-meteora
photo   "cloudy-rainy-day.JPG"           coffee-on-a-rainy-day
photo   "exterior.JPG"                   parked-among-the-spruces
photo   "exterior-2.JPG"                 the-cafe-is-open
photo   "exterior-3.JPG"                 a-morning-in-the-meadow
photo   "exterior-4.png"                 humbaer-in-the-sun
photo   "interior-5.JPG"                 the-bed-with-the-doors-open
diagram "miserable-days-solar.PNG"       four-bleak-days

echo "Overwintering in Greece →"
GR="$SRC/vanlife-griechenland"
greece() { fit "$GR/$1" "$OUT/overwintering-in-greece/$2.webp" 2000 72; }

greece "titelbild.jpeg"                                           cover
greece "auf abendspaziergang im alten korinth.jpeg"                evening-walk-in-ancient-corinth
greece "ein wundervolles ausflugsziel - die insel poros. wir haben den camper auf der festlandseite geparkt; die fähre hat pro person pro weg 1.30 euro gekostet.jpeg" poros
greece "die türkisblauen bucht bei nafplio.jpeg"                   turquoise-bay-near-nafplio
greece "nafplio old town.jpeg"                                     nafplio-old-town
greece "gebirgsstrassen nach monemvasia, 3 stunden lang schlängeln durch wilde, raue natur.jpeg" mountain-roads-to-monemvasia
greece "ab und zu haben wir uns auch richtig zeit für touristische highlights genommen - monemvasia.JPG" monemvasia
greece "simos beach auf der insel elafonisos. mit den bikes sind wir auf die fähre gegangen. wir sind bis zur simos beach gefahren. durch diese enge kann man spazieren bei knietiefem wasser, wenn ebbe ist.JPG" simos-beach-elafonisos
greece "gemütliche strassen am meer in griechenland. am besten in gemässigtem tempo geniessen.jpeg" coastal-roads
greece "ausblick auf leonidio.jpeg"                                view-over-leonidio
greece "downtown leonidi.jpeg"                                     downtown-leonidio
greece "markttag in leonidio.jpeg"                                 market-day-leonidio
greece "hier kommt der leckerste olivenöl der welt.jpeg"           the-olive-oil-man
greece "die holzofenbäckerei in leonidio.jpeg"                     wood-fired-bakery-leonidio
greece "die schönsten momente gibt es mit frischem spanakopita aus der holzofenbäckerei.jpeg" spanakopita-from-the-bakery
greece "die rustikale taverne in leonidio.jpeg"                    rustic-taverna-leonidio
greece "eine göttliche wahl - taverne in leonidio.jpeg"            a-divine-taverna-leonidio
greece "vegetarisches lieblingsessen in griechenland. gegrillte zucchettibälle, viel tzatziki und griechischer salat. einfach göttlich.jpeg" zucchini-balls-and-greek-salad
greece "klettern in leonidi. frank klettert zum ersten mal und fühlt sich wie ein äffchen.jpeg" climbing-in-leonidio
greece "wandern in leonidio.jpeg"                                  hiking-in-leonidio
greece "wandern in leonidio.JPG"                                   hiking-in-leonidio-2
greece "blick auf das elona kloster in kosmas.jpeg"                elona-monastery
greece "ein pumpkin pie zum geniessen. die griechischen konditoreien haben uns besonders angetan.jpeg" pumpkin-pie
greece "brunch mit ausblick auf die akropolis in athen. evelynes geburtstag haben wir gemeinsam in athen verbracht.jpeg" brunch-with-an-acropolis-view
greece "wer in athen war, war in athen und nicht in griechenland. bäckereien, die es sonst nirgendwo im land gehen und die es mit cosmopolitan places in paris und london locker aufnehmen können.JPG" athens-bakery
greece "humbär frisch lackiert - wir zu besuch in der lackiererei in volos.jpeg" humbaer-freshly-painted
greece "wir nehmen glücklich einen wunderschönen neuen humbär entgegen.jpeg" picking-up-humbaer
greece "das mietauto - kein komfortabler ersatz für humbär, legt dafür aber mindestens doppelt so schnell distanz zurück und kostet auf der autobahn halb so viel.jpeg" the-rental-car
greece "purer chaos im miet-van. da hat man noch mehr zeit draussen verbracht.jpeg" rental-car-chaos
greece "wandern im pelion. die kastanienbäume erinnern uns zu sehr an wandern im tessin in der heimat.jpeg" hiking-on-pelion
greece "ein cafe auf dem pelion. wir waren weit und breit die einzigen gäste und hatten den ganzen ausblick für uns.jpeg" cafe-on-pelion
greece "die schönsten tage in chalkidiki, während unser van humbär restauriert und lackiert wurde.jpeg" chalkidiki-days
greece "sonnenuntergang bei volos.jpeg"                            sunset-near-volos
greece "zu besuch in der legendären filia laundry am in elea.jpeg" filia-laundry
greece "vegane ravioli in der filia laundry.jpeg"                  vegan-ravioli-at-filia-laundry
greece "vegane ravioli bei der filia laundry.jpeg"                 vegan-ravioli-at-filia-laundry-2
greece "und die gibt es auch - gemütliche regentage mit kerzenlicht und meeresrauschen.JPG" rainy-days-by-candlelight
greece "und wenn alles gestimmt hat, gab es sonnenuntergänge wie diese.jpeg" sunsets-like-this
greece "und wenn alles stimmt, wacht man mit sonnenaufgang und meerblick im bilderbuch-vanlif auf.jpeg" sunrise-with-a-sea-view
greece "lesen und den abend im warmen van ausklingen lassen.jpeg"  reading-in-the-warm-van
greece "es gibt spanakopita aus dem humbär ofen.jpeg"              spanakopita-from-humbaers-oven
greece "gutes brot und selbst gemachtes tzatziki.jpeg"             bread-and-tzatziki
greece "ein einsamer stellplatz.jpeg"                              a-lonely-spot
greece "der traumstellplatz am meer.jpeg"                          the-dream-spot-by-the-sea
greece "und manchmal ist man so überhaupt nicht allein - kuschelcamping!.jpeg" cozy-camping
greece "bilderbuch-vanlife in griechenland.jpeg"                   picture-book-vanlife
greece "ein lost place wahrzeichen - dimitros shipwreck.JPG"       dimitrios-shipwreck
greece "lieblingsstellplatz paralia salanti bei sonnenuntergang.jpeg" paralia-salanti-at-sunset
greece "freundliche strassenhunde am stellplatz.jpeg"              street-dogs-at-camp
greece "outdoor-dusche mit ausschliesslich natürlichen produkten.JPG" outdoor-shower
greece "wir alle profitieren von einer sauberen welt.jpeg"         cleaning-up-the-beach
greece "hier nehmen wir legendäre 5 kilo orangen und zitronen entgegen.jpeg" five-kilos-of-citrus
greece "was macht man mit 5 kilo zitronen und orangen? orangen essen, zitronen zu zitronensaft pressen.jpeg" pressing-lemons
greece "unsere neuen zitronen im sonnenuntergang.jpeg"             lemons-at-sunset
greece "eine ganz besondere begegnung - landschildkröte in athen.JPG" tortoise-in-athens
greece "autofahren in griechenland. manchmal kommt man aus dem staunen nicht heraus.jpeg" driving-in-greece
greece "ein markteinkauf am strassenrand. garantiert das leckerste gemüse, aber unbedingt bargeld dabei haben.jpeg" roadside-market
greece "die besten früchte gibt es an ständen am strassenrand.jpeg" roadside-fruit-stand
greece "frisches gemüse vom feld. hat uns ein ganz lieber grieche einfach in die hand gedrückt.jpeg" vegetables-from-the-field
greece "frühstück mit mediterranem touch - kumquats, orangenmarmelade und baklava.jpeg" mediterranean-breakfast
greece "franks lieblingsdessert - portokalopita.jpeg"              portokalopita
greece "irgendwann haben wir es selbst ausprobiert mit backen - baklava mit filoteig, denn man hier überall im supermarkt in der gefrierabteilung findet.jpeg" homemade-baklava
greece "ein bisschen kalt zum schwimmen ist es ja schon.JPG"       a-bit-cold-for-a-swim
greece "kälter als es aussieht - eine heisswasserquelle auf der insel methana.jpeg" hot-spring-on-methana
greece "lauwarmes thermalwasser auf methana.jpeg"                  thermal-water-on-methana
greece "schon mal in einer heissen quellen gefrühstückt? in den thermopylen haben wir es geschafft.jpeg" breakfast-at-thermopylae
greece "mit freunden wurde das menschenleere chalkidiki plötzlich voll lebensfreude.jpeg" chalkidiki-full-of-life
greece "mit freunden auf chalkidiki.jpeg"                          friends-in-chalkidiki
greece "filmabend auf chalkidiki.jpeg"                             movie-night-in-chalkidiki
greece "kaffee am meer!.jpeg"                                      coffee-by-the-sea
greece "kaffee und kuchen am meer?.jpeg"                           coffee-and-cake-by-the-sea
greece "das schönste, wenn man den van stehen lassen kann und die umgebung mit dem rad erkunden kann.jpeg" exploring-by-bike
greece "meteora kloster. wir haben gelernt dass kloster in griechenland ein non-negotiable ist was besuch angeht - immer ein genuss.jpeg" meteora
greece "freundliche begegnungen in griechenland - strassenhunde.jpeg" street-dogs

echo "Vanlife in Spain & Portugal →"
IB="$SRC/vanlife-iberian"
iberian() { fit "$IB/$1" "$OUT/vanlife-spain-portugal/$2.webp" 2000 72; }

iberian "titel.JPG"                                                cover
iberian "die ikonische bucht an der costa brava.JPG"                costa-brava-cove
iberian "es ist frühling in granada.JPG"                            spring-in-granada
iberian "leckereien in sevilla.JPG"                                 treats-in-seville
iberian "vor einem secondhand-laden in malaga. hier haben wir unseren campingstuhl gefunden.JPG" secondhand-shop-in-malaga
iberian "wildblumen im spanischen frühling.jpg"                     wildflowers-in-spring
iberian "mit neuem mut ins vanlife.jpg"                             new-courage
iberian "einen stellplatz direkt am meer in spanien.JPG"            right-by-the-sea-in-spain
iberian "ein stellplatz mit meerblick.JPG"                          a-spot-with-a-sea-view
iberian "humbär auf einem sonnigen campingplatz an der costa blanca.JPG" costa-blanca-campground
iberian "in einem vorort von valencia. von hier kommt die paella.JPG" valencia-home-of-paella
iberian "eine vegane paella.JPG"                                    vegan-paella
iberian "wir haben eine wüsten-wanderung gemacht in der tabernas wüste.JPG" tabernas-desert-hike
iberian "nach einer wanderung im cabo de gata.JPG"                  hiking-cabo-de-gata
iberian "es ist sonnenuntergang am cabo de gata.JPG"                sunset-at-cabo-de-gata
iberian "die idyllischen buchten der algarve.JPG"                   idyllic-algarve-coves
iberian "bucht an der algarve. hieraus könnte man ein wallpaper machen, nicht?.JPG" algarve-wallpaper-cove
iberian "natural bridge an der algarve.JPG"                         natural-bridge-algarve
iberian "laranjas aus der algarve machen einfach glücklich.JPG"     laranjas
iberian "die schönste wasser-farbe die man sich erdenken kann, nicht?.JPG" turquoise-water
iberian "die felsen am strand sind einfach rot. i mean whaaaat?.JPG" red-rocks
iberian "portugal hat definitiv die beeindruckendsten strände bekommen.JPG" portugals-beaches
iberian "praia dos tomates.JPG"                                     praia-dos-tomates
iberian "der campingplatz ist so gut wie der einzige ort, an dem man richtig campen darf - mit tisch und stuhl - und in dem fall einem feuerchen.JPG" campfire-at-the-campground
iberian "sonnenuntergang in der algarve.JPG"                        algarve-sunset
iberian "happy frank im sonnenuntergang an der algarve.JPG"         happy-frank-algarve
iberian "am strand von lagos, algarve.JPG"                          beach-in-lagos
iberian "durch die strassen von lagos.JPG"                          streets-of-lagos
iberian "goldenes licht und leckerer kaffee in lagos.JPG"           golden-light-coffee-lagos
iberian "in lagos findest du genügend unendlich hübsche surf-cafés.JPG" surf-cafes-lagos
iberian "sagres ist definitiv das surf-mekka.jpg"                   sagres
iberian "frühstück mit einem ausblick auf die surfer.JPG"           breakfast-watching-surfers
iberian "gourmet-vanlife-essen auf dem aldi-parkplatz.JPG"          gourmet-on-the-aldi-lot
iberian "der geheime stellplatz vor dem surfen.JPG"                 secret-spot-before-surfing
iberian "nach der surflektion in arrifana. es hat spass gemacht!.JPG" after-surfing-in-arrifana
iberian "es ist date-day in lissabon!.JPG"                          its-date-day
iberian "durch die strassen von lissabon.JPG"                       streets-of-lisbon
iberian "pastel de nata in den lebhaften strassen lissabons.JPG"    pastel-de-nata-lisbon
iberian "gespannt auf einen bus warten.JPG"                         waiting-for-the-bus
iberian "date day in lissabon.JPG"                                  date-day-in-lisbon
iberian "ein picknick am meer für unser date day!.JPG"              date-day-picnic
iberian "angekommen im surf-café in ericeira.JPG"                   surf-cafe-ericeira
iberian "diese beeindruckende landschaft befindet sich bei peniche, portugal.jpg" peniche
iberian "am strand bis in den sonnenuntergang.jpg"                  beach-until-sunset
iberian "hach, was für ein schöner ort - porto.JPG"                 porto
iberian "cafés, wie man sich vorstellt. porto, portugal.JPG"        cafes-in-porto
iberian "hier ausserhalb der stadt haben wir gepart für porto.JPG"  parked-outside-porto
iberian "nach dem thermalbadbesuch in galizien.jpg"                 after-the-hot-springs
iberian "am strand in galizien.JPG"                                 beach-in-galicia
iberian "ab und zu führt die ruta del cares an den klippen vorbei.JPG" ruta-del-cares
iberian "24 kilometer geschafft. im sonnenuntergang in den bergen.JPG" twenty-four-kilometers
iberian "türkisblaues wasser im picos de europa... und wilde erdbeeren!.JPG" wild-strawberries-picos
iberian "vanlife in picos de europa. ein traum!.JPG"                vanlife-in-picos
iberian "das leben im van.JPG"                                      life-in-the-van
iberian "ein stellplatz in der natur.JPG"                           a-spot-in-nature
iberian "und ab und zu hatte humbär flauschigen besuch.jpg"         fluffy-visitor
iberian "picknick am strand?.JPG"                                   beach-picnic
iberian "happy evelyne.JPG"                                         happy-evelyne
iberian "panorama-route richtung tossa de mar.JPG"                 road-to-tossa-de-mar
iberian "eine malerische bucht an der costa brava.JPG"              picturesque-costa-brava-cove
iberian "valencia-1.JPG"                                            valencia-coffee-to-go
iberian "valencia-2.JPG"                                            valencia-oranges
iberian "valencia-3.JPG"                                            valencia-rooftops
iberian "valencia-4.JPG"                                            valencia-facades
iberian "valencia-5.JPG"                                            valencia-street-lamp
iberian "valencia-6.JPG"                                            valencia-iced-coffee
iberian "valencia-7.JPG"                                            valencia-red-door
iberian "valencia-8.JPG"                                            valencia-doorway
iberian "grelos auf dem induktionsherd.JPG"                         grelos-on-the-stove
iberian "blick of das kloster san juan de gaztelugatxe.JPG"          gaztelugatxe-hermitage
iberian "wie aus einem film. wo sind die drachen?.JPG"              gaztelugatxe-dragons
iberian "ein wocheneinkauf bei carrefour.JPG"                       groceries-from-carrefour
iberian "aussicht auf die insel bei gaztelugatxe.JPG"              gaztelugatxe-island
iberian "frisches brot aus granada.JPG"                             fresh-bread-granada
iberian "morgenlicht in sevilla.JPG"                                morning-light-seville
iberian "schöne strassen in granada.JPG"                            streets-of-granada
iberian "vanlife in spanien und portugal.jpg"                       vanlife-couple-at-sunset
iberian "wasser auffüllen auf einem campingplatz in cabo de gata.JPG" water-refill-cabo-de-gata
iberian "willkommen im vanlife!.JPG"                                welcome-to-vanlife
iberian "in einem waschsalon direkt in den picos de europa.JPG"     laundromat-in-picos
iberian " Dom Luís I Bridge, von Gustave Eiffel.JPG"                 dom-luis-bridge-porto
iberian "die leckerste zimtschnecke ausserhalb von skandinavien?.JPG" cinnamon-bun-porto
iberian "was gibt es besseres als pastel de nata in porto?.JPG"     pastel-de-nata-porto

echo "Done."
