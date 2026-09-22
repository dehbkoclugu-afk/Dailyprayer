# Adaptive layout and IME matrix

Critical flows are release-tested against these window classes. A pass means
the focused field and its primary action can both be reached without dismissing
the IME, and no fixed vertical composition clips content.

| Flow | 360×640 portrait | 640×360 landscape | 600×480 split | 840+ expanded/foldable | 200% text |
|---|---|---|---|---|---|
| Onboarding name + Continue | Scroll + keyboard avoidance | Scroll + keyboard avoidance | Scroll + keyboard avoidance | Single safe pane | Scroll |
| Journal composer + Save | SectionList + keyboard avoidance | SectionList + keyboard avoidance | SectionList + keyboard avoidance | Single safe pane | Composer grows |
| Prayer player controls | Full composition | Vertically scrollable compact mode | Vertically scrollable compact mode | Centred content | Vertically scrollable |
| Paywall plans + Continue | Scroll | Compact 180 dp hero + scroll | Compact hero + scroll | Single safe pane | Hero/content grow + scroll |

Expanded Today and Bible surfaces use two equal panes separated by a 32–56 dp
centre gutter. Primary cards and actions are children of one pane, so they do
not cross a typical foldable hinge. Window width—not physical device name—drives
the rule, which also covers freeform and split-screen resizing.

Image decode policy: the six A13 plan covers ship as 512×307 1× WebP files and
1024×614 `@2x` WebP files. React Native selects the density-appropriate source;
150–170 dp cards no longer decode the 1024 px bitmap at 1× density.
