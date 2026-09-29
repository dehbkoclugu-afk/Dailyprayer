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
  # A downloadable locale appears before its release manifest has loaded.
  # Let the catalog settle before tapping a row that would otherwise report
  # the pack as unavailable.
  if [ "$route" = "scripture-language" ] && [ "$native_name" != "English" ] && \
     [ "$native_name" != "Türkçe" ] && [ "$native_name" != "Español" ] && \
     [ "$native_name" != "Deutsch" ]; then
    sleep 12
  else
    sleep 2
  fi

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
        # UIAutomator includes offscreen React Native rows with inverted or
        # viewport-clipped bounds. Tapping their midpoint silently does nothing.
        if not (0 <= left < right <= 720 and 0 <= top < bottom <= 1600):
            continue
        print((left + right) // 2, (top + bottom) // 2)
        break
PY
)"
    if [ -n "$coordinates" ]; then
      read -r x y <<< "$coordinates"
      adb shell input tap "$x" "$y"
      # Downloadable content and Scripture packs need time to finish before
      # another force-stop. The captured Today/Profile screens are reviewed
      # together so any mismatched language remains visible.
      if [ "$native_name" = "Tagalog" ] || {
        [ "$route" = "scripture-language" ] &&
        { [ "$native_name" = "Português" ] ||
          [ "$native_name" = "Français" ] ||
          [ "$native_name" = "Italiano" ]; }
      }; then
        sleep 45
      else
        sleep 4
      fi
      rm -f "$dump_file"
      return 0
    fi
    adb shell input swipe 360 1350 360 400 300
    sleep 1
  done

  rm -f "$dump_file"
  echo "Could not select application language: $native_name" >&2
  return 1
}

profile_has_both_languages() {
  local native_name="$1"
  local dump_file
  dump_file="$(mktemp)"
  adb shell am force-stop "$package"
  adb shell am start -W -a android.intent.action.VIEW -d 'lumen://profile' -p "$package" >/dev/null
  # Restoring an application content pack is gated by the splash screen; give
  # the new locale time to register before inspecting the profile rows.
  sleep 15
  adb shell uiautomator dump /sdcard/selaora-profile.xml >/dev/null
  adb exec-out cat /sdcard/selaora-profile.xml > "$dump_file"
  if python3 - "$dump_file" "$native_name" <<'PY'
import sys
import xml.etree.ElementTree as ET

root = ET.parse(sys.argv[1]).getroot()
name = sys.argv[2]
values = [node.attrib.get('text', '') for node in root.iter('node')]
# The app language and the independent Bible language are separate rows.
sys.exit(0 if values.count(name) >= 2 else 1)
PY
  then
    rm -f "$dump_file"
    return 0
  fi
  echo "Profile language rows after selecting $native_name:" >&2
  python3 - "$dump_file" <<'PY'
import sys
import xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
for node in root.iter('node'):
    value = node.attrib.get('text', '')
    if value:
        print(value[:140])
PY
  adb exec-out screencap -p > "${output_dir}/language-mismatch-${locale}.png" || true
  cp "$dump_file" "${output_dir}/language-mismatch-${locale}.xml"
  adb logcat -d > logcat.txt || true
  rm -f "$dump_file"
  return 1
}

for locale_spec in \
  "tl-PH|Tagalog" "en-US|English" "tr-TR|Türkçe" "es-419|Español" "pt-BR|Português" \
  "fr-FR|Français" "de-DE|Deutsch" "it-IT|Italiano"; do
  locale="${locale_spec%%|*}"
  native_name="${locale_spec#*|}"
  select_language "application-language" "$native_name"
  # Scripture is an independent preference. Keep verse-of-the-day and Bible
  # content in the same locale as the surrounding store screenshot UI.
  for attempt in 1 2 3; do
    select_language "scripture-language" "$native_name"
    if profile_has_both_languages "$native_name"; then break; fi
    if [ "$attempt" = 3 ]; then
      echo "Application and Bible languages did not match for $locale" >&2
      exit 1
    fi
  done

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
