#!/usr/bin/env bash
set -euo pipefail

package="com.lumen.dailyprayer"
output_dir="visual-smoke"
mkdir -p "$output_dir"

# Match the narrow Android layout we actually care about while keeping the
# headless emulator's framebuffer modest. The default Pixel 6 1080x2400
# surface proved unnecessarily heavy during repeated screencaps on hosted
# runners, and it also missed the ~360dp layout that exposed the card bug.
adb shell wm size 720x1600
adb shell wm density 320
sleep 2

capture_screen() {
  local route="$1"
  local name="$2"
  local target="${output_dir}/${locale}/${theme}-${name}.png"
  local pending="${target}.pending"
  mkdir -p "$(dirname "$target")"
  # Each route gets a fresh app process. Keeping many image-heavy routes on the
  # same navigation stack made the headless emulator progressively exhaust its
  # graphics budget even though the app itself never raised a fatal exception.
  adb shell am force-stop "$package"
  sleep 1
  adb shell am start -W -a android.intent.action.VIEW -d "lumen://${route}" -p "$package" >/dev/null
  sleep 2
  adb exec-out screencap -p > "$pending"
  test -s "$pending"
  mv "$pending" "$target"
}

select_language() {
  local route="$1"
  local native_name="$2"
  local dump_file
  dump_file="$(mktemp)"

  adb shell am force-stop "$package"
  adb shell am start -W -a android.intent.action.VIEW -d "lumen://${route}" -p "$package" >/dev/null
  sleep 2

  for _ in $(seq 1 40); do
    adb shell uiautomator dump /sdcard/selaora-language.xml >/dev/null
    adb exec-out cat /sdcard/selaora-language.xml > "$dump_file"
    coordinates="$(python3 - "$dump_file" "$native_name" <<'PY'
import re
import sys
import xml.etree.ElementTree as ET

root = ET.parse(sys.argv[1]).getroot()
label = sys.argv[2]
for node in root.iter('node'):
    text = node.attrib.get('text', '')
    description = node.attrib.get('content-desc', '')
    if text != label and description != label and not description.startswith(f'{label},'):
        continue
    match = re.fullmatch(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', node.attrib.get('bounds', ''))
    if match:
        left, top, right, bottom = map(int, match.groups())
        print((left + right) // 2, (top + bottom) // 2)
        break
PY
)"
    if [ -n "$coordinates" ]; then
      read -r x y <<< "$coordinates"
      adb shell input tap "$x" "$y"
      # Wait until the language screen navigates back after a bundled choice
      # or a verified remote pack install.  The tapped row stays clickable
      # while the download is still in progress.
      for retry in $(seq 1 45); do
        sleep 2
        adb shell uiautomator dump /sdcard/selaora-language.xml >/dev/null
        adb exec-out cat /sdcard/selaora-language.xml > "$dump_file"
        if python3 - "$dump_file" "$native_name" <<'PY'
import sys
import xml.etree.ElementTree as ET

root = ET.parse(sys.argv[1]).getroot()
label = sys.argv[2]
for node in root.iter("node"):
    description = node.attrib.get("content-desc", "")
    if (description == label or description.startswith(f"{label},")) and node.attrib.get("clickable") == "true":
        sys.exit(1)
sys.exit(0)
PY
        then
          # Reopen the selector and confirm the saved preference is selected.
          adb shell am force-stop "$package"
          adb shell am start -W -a android.intent.action.VIEW -d "lumen://${route}" -p "$package" >/dev/null
          sleep 3
          for verify in $(seq 1 40); do
            adb shell uiautomator dump /sdcard/selaora-language.xml >/dev/null
            adb exec-out cat /sdcard/selaora-language.xml > "$dump_file"
            if python3 - "$dump_file" "$native_name" <<'PY'
import sys
import xml.etree.ElementTree as ET

root = ET.parse(sys.argv[1]).getroot()
label = sys.argv[2]
for node in root.iter("node"):
    description = node.attrib.get("content-desc", "")
    if (description == label or description.startswith(f"{label},")) and node.attrib.get("selected") == "true":
        sys.exit(0)
sys.exit(1)
PY
            then
              rm -f "$dump_file"
              return 0
            fi
            adb shell input swipe 360 1350 360 400 300
            sleep 1
          done
          echo "Language not selected after navigation: $route / $native_name" >&2
          rm -f "$dump_file"
          return 1
        fi
      done
      echo "Language selection did not complete: $route / $native_name" >&2
      rm -f "$dump_file"
      return 1
    fi
    adb shell input swipe 360 1350 360 400 300
    sleep 1
  done

  rm -f "$dump_file"
  echo "Could not select application language: $native_name" >&2
  return 1
}

for locale_spec in \
  "en-US|English" "tr-TR|Türkçe" "es-419|Español" "pt-BR|Português" \
  "fr-FR|Français" "de-DE|Deutsch" "it-IT|Italiano" "tl-PH|Tagalog"; do
  locale="${locale_spec%%|*}"
  native_name="${locale_spec#*|}"
  select_language "application-language" "$native_name"
  # Scripture is an independent preference. Keep verse-of-the-day and Bible
  # content in the same locale as the surrounding store screenshot UI.
  select_language "scripture-language" "$native_name"

  for theme in dawn vigil; do
    if [ "$theme" = "dawn" ]; then
      adb shell cmd uimode night no
    else
      adb shell cmd uimode night yes
    fi

    adb shell am force-stop "$package"
    sleep 1

    if [ "$theme" = "dawn" ]; then
      capture_screen "today" "today"
      capture_screen "bible" "bible"
      capture_screen "player?id=morning-light" "player"
      capture_screen "plan/peace-7" "plan-list"
    else
      capture_screen "today" "today"
      capture_screen "pray" "pray"
      capture_screen "journal" "journal"
      capture_screen "profile" "profile"
    fi

    # Keep the broader regression surface for the two original smoke locales.
    if [ "$locale" = "en-US" ] || [ "$locale" = "tr-TR" ]; then
      capture_screen "onboarding" "onboarding-welcome"
      capture_screen "onboarding/quiz" "onboarding-quiz"
      capture_screen "read?settings=1" "reading-settings"
      capture_screen "scripture-source" "scripture-source"
      capture_screen "plan/peace-7/0" "plan-reading"
      capture_screen "paywall" "paywall"
    fi
  done
done

adb logcat -d > logcat.txt
if grep -q "FATAL EXCEPTION" logcat.txt; then
  echo "Android visual smoke encountered a fatal exception." >&2
  exit 1
fi
