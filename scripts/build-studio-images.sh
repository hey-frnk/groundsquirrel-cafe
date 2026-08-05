#!/usr/bin/env bash
#
# Builds the web versions of the studio artwork from the originals in `res/`.
#
#   ./scripts/build-studio-images.sh
#
# Requires ImageMagick (`brew install imagemagick`). Only needs to run when an
# original changes — the generated files under public/images/studio/ are
# committed, because the site is a static export and never processes images at
# request time.
#
# Everything published here is deliberately downscaled and stripped of metadata:
# the originals are print-resolution paintings, and nothing on the web should be
# large enough to be reused as a print. Long edge caps below are chosen to stay
# crisp on a 2× display at the size the layout actually renders them, and no
# larger:
#
#   portfolio gallery   1000 px  (renders at ~340 px in a three-column masonry)
#   project galleries   1200 px  (renders at ~600 px in a two-column grid)
#   project covers      1000 px  (renders at ~420 px on a carousel card)
#
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="res/portfolio_website"
OUT="public/images/studio"

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

art() { fit "$1" "$OUT/portfolio/$2.webp" 1000 68; }
plate() { fit "$1" "$OUT/projects/$2.webp" 1200 70; }
cover() { fit "$1" "$OUT/projects/$2.webp" 1000 72; }

echo "Portfolio →"
art "$SRC/ERS.JPG"                          field-guide-eurasian-red-squirrel
art "$SRC/painting process.JPG"             squirrels-of-the-world-in-progress
art "$SRC/IMG_0539.jpg"                     flamingos-above-the-clouds
art "$SRC/IMG_8621.JPG"                     field-guide-california-ground-squirrel
art "$SRC/IMG_3102.PNG"                     elephants-at-kilimanjaro
art "$SRC/IMG_3987.JPG"                     drawing-from-the-van-window
art "$SRC/IMG_4253.JPG"                     falling-from-a-branch
art "$SRC/IMG_7694.JPG"                     squirrel-cards-on-the-rock
art "$SRC/IMG_3110.PNG"                     chipmunk
art "$SRC/IMG_9525.JPG"                     drawing-at-the-camp-table
art "$SRC/Unbenanntes_Projekt.jpg"          sea-turtle-in-the-waves
art "$SRC/IMG_1507.JPG"                     field-guide-african-bush-squirrel
art "$SRC/IMG_3527.JPG"                     sea-stars
art "$SRC/IMG_4256.JPG"                     tree-climbers-at-sundown
art "$SRC/IMG_6779.JPG"                     bee-sticker-sheet
art "$SRC/Unbenanntes_Projekt Kopie.jpg"    elephant-study
art "$SRC/IMG_4254.JPG"                     riding-the-whale-shark
art "$SRC/IMG_1927.JPG"                     a-studio-with-a-mountain-view

echo "Wenn der Himmel Weihnachten berührt →"
WH="$SRC/Wenn der Himmel Weihnachten berührt"
cover "$SRC/1070128_540x540_c.jpg.webp"      christmas/cover
plate "$WH/IMG_07.JPG"                      christmas/angel-workshop
plate "$WH/IMG_13.JPG"                      christmas/wall-of-clocks
plate "$WH/IMG_29.JPG"                      christmas/snowfall-in-the-forest
plate "$WH/IMG_04.JPG"                      christmas/lit-windows
plate "$WH/IMG_09.JPG"                      christmas/feather
plate "$WH/IMG_05.JPG"                      christmas/recorder-and-garland
plate "$WH/Mostaccioli.TIF"                 christmas/mostaccioli
plate "$SRC/IMG_11.JPG"                     christmas/cat-and-lamb

echo "The Power Cut →"
PC="$SRC/The Power Cut"
cover "$PC/IMG_8987.JPG"                    power-cut/cover-pantry-by-torchlight
plate "$PC/IMG_8987.JPG"                    power-cut/pantry-by-torchlight
plate "$PC/IMG_5087.JPG"                    power-cut/cooking-by-candlelight
plate "$PC/IMG_9845.JPG"                    power-cut/a-ceiling-full-of-stars
plate "$PC/IMG_2546.JPG"                    power-cut/the-street-goes-dark

echo "Studio marks →"
fit "res/studio/IMG_4249.PNG" "$OUT/brand/studio-badge.webp" 700 82
# Trimmed of its transparent margin so the layout can align the mark itself,
# not the empty space the export happened to carry.
magick "$SRC/squirrelstudio.png" -trim +repage -resize '1000x1000>' -strip \
  -define webp:method=6 -quality 88 "$OUT/brand/studio-wordmark.webp"
printf '  %-58s %s\n' "studio-wordmark.webp" "$(du -h "$OUT/brand/studio-wordmark.webp" | cut -f1)"

echo "Done."
