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

echo "Done."
