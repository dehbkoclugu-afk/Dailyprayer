#!/usr/bin/env bash
set -euo pipefail

package="com.lumen.dailyprayer"
output_dir="visual-smoke"
mkdir -p "$output_dir"

capture_screen() {
  local route="$1"
  local name="$2"
  adb shell am start -W -a android.intent.action.VIEW -d "lumen://${route}" -p "$package" >/dev/null
  sleep 2
  adb exec-out screencap -p > "${output_dir}/${theme}-${name}.png"
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
  capture_screen "bible" "bible"
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
