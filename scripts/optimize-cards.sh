#!/usr/bin/env bash
#
# optimize-cards.sh - shrink exported mission-card PNGs before importing them
# into the repo.
#
# By default the optimisation is LOSSLESS: pixels stay byte-for-byte identical
# (safe for print), files get ~3-4x smaller, and PNG metadata (timestamps etc.)
# is stripped so re-exports of unchanged cards no longer show up as git changes.
#
# Optionally reduce the colour count for an extra ~10-20% on top. For these flat
# vector cards that is visually lossless down to ~512 colours, but it does alter
# pixels, so it is off by default.
#
# Usage:
#   scripts/optimize-cards.sh <folder> [<folder> ...] [--colors N] [--jobs N] [--dry-run]
#
# Examples:
#   scripts/optimize-cards.sh "$HOME/Downloads/update van cards"   # lossless, whole export
#   scripts/optimize-cards.sh mtg tarot                            # lossless, in-repo
#   scripts/optimize-cards.sh mtg tarot --colors 1024              # extra shrink
#
# Requires: oxipng        (brew install oxipng)
# Optional: imagemagick   (brew install imagemagick) - only for --colors
#
set -euo pipefail

colors=""
jobs="$(sysctl -n hw.ncpu 2>/dev/null || echo 4)"
dry=0
dirs=()

while [ $# -gt 0 ]; do
  case "$1" in
    --colors)  colors="${2:?--colors needs a number}"; shift 2 ;;
    --jobs)    jobs="${2:?--jobs needs a number}"; shift 2 ;;
    --dry-run) dry=1; shift ;;
    -h|--help) sed -n '2,30p' "$0" | sed 's/^#\{0,1\} \{0,1\}//'; exit 0 ;;
    -*)        echo "unknown option: $1" >&2; exit 2 ;;
    *)         dirs+=("$1"); shift ;;
  esac
done

[ ${#dirs[@]} -gt 0 ] || dirs=(".")

command -v oxipng >/dev/null || { echo "error: oxipng not found - run 'brew install oxipng'" >&2; exit 1; }
if [ -n "$colors" ]; then
  command -v magick >/dev/null || { echo "error: imagemagick not found - run 'brew install imagemagick'" >&2; exit 1; }
fi

# Collect every PNG under the given folders (handles spaces in paths).
pngs=()
while IFS= read -r -d '' f; do pngs+=("$f"); done \
  < <(find "${dirs[@]}" -type f -name '*.png' -print0)
n=${#pngs[@]}
[ "$n" -gt 0 ] || { echo "no PNGs found in: ${dirs[*]}"; exit 0; }

kb() { du -ck "$@" | tail -1 | cut -f1; }
before=$(kb "${pngs[@]}")
echo "Found $n PNG(s), ${before} KB total in: ${dirs[*]}"

if [ "$dry" -eq 1 ]; then echo "(dry-run, nothing written)"; exit 0; fi

# Optional, lossy-but-imperceptible colour reduction. -dither None keeps the art
# flat and never adds colours; >256 colours stays RGBA truecolor (no palette).
if [ -n "$colors" ]; then
  echo "Reducing to <= ${colors} colours ($jobs parallel)..."
  printf '%s\0' "${pngs[@]}" \
    | xargs -0 -P "$jobs" -I{} magick {} -dither None -colors "$colors" {}
fi

# Lossless recompress + strip metadata. --strip safe keeps colour-correction
# chunks (gamma/ICC) so print colour is untouched.
echo "Lossless oxipng (-o max, $jobs threads)..."
oxipng -r -o max --strip safe -t "$jobs" -q "${dirs[@]}"

after=$(kb "${pngs[@]}")
ratio=$(awk -v b="$before" -v a="$after" 'BEGIN{printf "%.2f", (a>0 ? b/a : 0)}')
echo "Done: ${before} KB -> ${after} KB  (${ratio}x smaller)"
