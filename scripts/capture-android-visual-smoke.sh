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
  local target="${output_dir}/${theme}-${name}.png"
  local pending="${target}.pending"
  # Each route gets a fresh app process. Keeping many image-heavy routes on the
  # same navigation stack made the headless emulator progressively exhaust its
  # graphics budget even though the app itself never raised a fatal exception.
  adb shell am force-stop "$package"
  sleep 1
  adb logcat -c
  adb shell am start -W -a android.intent.action.VIEW -d "lumen://${route}" -p "$package" >/dev/null
  sleep 2
  adb logcat -d > "${output_dir}/${theme}-${name}.logcat.txt"
  if grep -q 'FATAL EXCEPTION' "${output_dir}/${theme}-${name}.logcat.txt"; then
    echo "${route}: Android fatal exception" >&2
    exit 1
  fi
  # A non-empty screenshot of the splash was previously accepted as success.
  # Require the app's rendered-root marker for this fresh process first.
  if ! grep -q 'SELAORA_UI_READY' "${output_dir}/${theme}-${name}.logcat.txt"; then
    echo "${route}: app did not render its root UI" >&2
    exit 1
  fi
  adb shell uiautomator dump /sdcard/selaora-visual.xml >/dev/null
  adb shell cat /sdcard/selaora-visual.xml > "${output_dir}/${theme}-${name}.xml"
  if ! grep -q "package=\"${package}\"" "${output_dir}/${theme}-${name}.xml"; then
    echo "${route}: app is not the visible screen" >&2
    exit 1
  fi
  adb exec-out screencap -p > "$pending"
  test -s "$pending"
  mv "$pending" "$target"
}

for theme in dawn vigil; do
  if [ "$theme" = "dawn" ]; then
    adb shell cmd uimode night no
  else
    adb shell cmd uimode night yes
  fi

  adb shell am force-stop "$package"
  sleep 1

  capture_screen "today" "today"
  capture_screen "onboarding" "onboarding-welcome"
  capture_screen "onboarding/quiz" "onboarding-quiz"
  capture_screen "bible" "bible"
  capture_screen "search" "search"
  capture_screen "read?settings=1" "reading-settings"
  capture_screen "scripture-source" "scripture-source"
  capture_screen "plan/peace-7" "plan-list"
  capture_screen "plan/peace-7/0" "plan-reading"
  capture_screen "pray" "pray"
  capture_screen "player?id=morning-light" "player"
  capture_screen "journal" "journal"
  capture_screen "profile" "profile"
  capture_screen "paywall" "paywall"
done

adb logcat -d > logcat.txt
if grep -q "FATAL EXCEPTION" logcat.txt; then
  echo "Android visual smoke encountered a fatal exception." >&2
  exit 1
fi
