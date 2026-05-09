#!/bin/bash
# Converts SVG assets to PNG for Google Play Store
# Requires: brew install librsvg

set -e
STORE_DIR="$(cd "$(dirname "$0")" && pwd)"

check_dep() {
  if ! command -v rsvg-convert &>/dev/null; then
    echo "❌  rsvg-convert not found. Install with: brew install librsvg"
    exit 1
  fi
}

check_dep

echo "🎨  Converting store assets to PNG..."

rsvg-convert -w 512  -h 512  "$STORE_DIR/icon.svg"            -o "$STORE_DIR/icon.png"
echo "✅  icon.png (512×512)"

rsvg-convert -w 1024 -h 500  "$STORE_DIR/feature_graphic.svg" -o "$STORE_DIR/feature_graphic.png"
echo "✅  feature_graphic.png (1024×500)"

echo ""
echo "📱  Screenshots: open the .html files in Chrome DevTools at 390×844"
echo "    and use Cmd+Shift+P → 'Capture full size screenshot'"
echo ""
echo "Done! Upload the PNG files to Google Play Console."
