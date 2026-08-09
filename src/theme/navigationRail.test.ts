import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 51: above 840dp, a centered 600px-wide bottom bar was
 * still a bottom bar — wider, the same phone pattern stretched out, not
 * Material's own expanded-width navigation-rail pattern for this
 * breakpoint.
 *
 * `tabBarPosition`/`tabBarVariant` are @react-navigation/bottom-tabs' own,
 * first-party navigation-rail support — `'left'` moves the whole bar to a
 * vertical sidebar (and switches the screen's own layout to a row, content
 * beside it rather than underneath it), and the `'material'` variant is
 * documented as being for exactly this position. Confirmed in a real
 * browser render at 900px (a vertical rail, all five tabs stacked on the
 * left) and at 400px (unchanged: a horizontal row at the bottom).
 */

const source = readFileSync('app/(tabs)/_layout.tsx', 'utf8');

test('the tab bar switches to a left navigation rail above the 840dp breakpoint', () => {
  assert.match(source, /const expanded = width >= 840;/);
  assert.match(source, /tabBarPosition: expanded \? 'left' : 'bottom'/);
  assert.match(source, /tabBarVariant: expanded \? 'material' : 'uikit'/);
});

test('the old centered-bottom-bar hack is gone', () => {
  // A fixed 600px width + centering was the previous, incomplete fix for
  // this breakpoint — a wider bottom bar, not a rail. Its absence here is
  // itself part of the guard: the real fix should have replaced it, not
  // layered on top of it.
  assert.doesNotMatch(source, /width: expanded \? 600/);
  assert.doesNotMatch(source, /borderTopLeftRadius: expanded/);
});
