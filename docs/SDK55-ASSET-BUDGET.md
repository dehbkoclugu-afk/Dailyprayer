# SDK 55 asset budget

Expo Router 55 pulls `expo-symbols` into its native-tab module graph. Its Android fallback includes 14 Material Symbols font variants, about 17 MB of the 28.4 MB exported assets, even though Selaora uses custom tabs. The previous 15 MiB asset gate therefore fails on the SDK upgrade without an app artwork change.

The asset gate is raised to 30 MiB for this SDK baseline. The independent 2 MiB single-asset gate and 60 MiB JS bundle gate remain in force. If Expo Router stops bundling the unused fonts in a later SDK, restore a tighter asset budget after measuring the release export.
