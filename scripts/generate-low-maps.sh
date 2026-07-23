#!/usr/bin/env bash
#
# generate-low-maps.sh — regenerate the half-resolution map set for the "Niska" quality toggle (#56).
#
# Reads every public/maps/*.webp and writes a half-size Lanczos copy into public/maps/low/ under the
# same filename. utils/maps.ts::mapImageUrl serves these when a player picks "Niska"; L.ImageOverlay
# stretches them to the registry's declared full-res bounds, so a softer file lands every pin in the
# exact same place. Commit the outputs like the full-res set.
#
# ⚠️ -pix_fmt yuva420p is MANDATORY. The source maps carry alpha and the app background shows through
# them; letting ffmpeg negotiate to yuv420p silently produces maps with an opaque black background,
# visible only on the "Niska" path.
#
# ⚠️ Re-run this whenever the full-res art in public/maps/ changes. Overwriting a full-res map without
# regenerating leaves every "Niska" player on the previous edition's art, with no error anywhere.
#
set -euo pipefail

# Always operate from the repo root (the directory above this script).
cd "$(dirname "${BASH_SOURCE[0]}")/.."

mkdir -p public/maps/low

for src in public/maps/*.webp; do
    name="$(basename "$src")"
    out="public/maps/low/$name"

    ffmpeg -y -loglevel error -i "$src" \
        -vf "scale=trunc(iw/2):trunc(ih/2):flags=lanczos" \
        -c:v libwebp -quality 85 -pix_fmt yuva420p \
        "$out"

    dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,pix_fmt -of csv=p=0 "$out")"
    echo "$out  ->  $dims"
done
