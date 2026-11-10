import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

// app.json embeds assets/fonts/ionicons.ttf natively (lowercase family name for
// Android). It must be the exact font whose glyph map @expo/vector-icons ships,
// or every icon renders blank after a vector-icons upgrade.
test('embedded Ionicons font matches the installed @expo/vector-icons font', () => {
  const embedded = readFileSync('assets/fonts/ionicons.ttf');
  const shipped = readFileSync('node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
  assert.ok(embedded.equals(shipped), 'copy the vector-icons Ionicons.ttf to assets/fonts/ionicons.ttf');
});
