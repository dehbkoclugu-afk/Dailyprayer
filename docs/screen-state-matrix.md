# Screen state matrix

Every asynchronous or collection-driven surface has a designed state. Alerts
use the same localized copy as the screen that launched the operation.

| Surface | Empty / initial | Loading / pending | Error / unavailable | Recovery |
|---|---|---|---|---|
| Scripture Search | Search prompt; no-results illustration after 2 chars | Indexed-search activity indicator while the active locale index is built | A missing/corrupt downloaded pack falls back to validated English | Clear query or choose a book/locale |
| Library | Per-tab icon and localized empty copy | Local stores hydrate before the route is shown | Corrupt storage resets only the affected store | Save/highlight/write CTA paths remain available |
| Reading Plan | Zero-completion progress is explicit | Local plan days need no network loading state | Invalid/missing plan or day uses `InvalidRouteState` | Back to the Bible plans catalog |
| Paywall | No artificial empty offer | Centred catalog activity state; purchase and restore have separate busy/pending states | Unavailable catalog and failed purchase/restore are localized | Retry, close, or contact support |
| Notifications | Reminder off is visible | Native permission/time picker owns progress | Denied permission and scheduling failure show a localized alert | Open system settings or select reminder again |
| Purchases | Restore-missing state is explicit | Catalog, purchase, pending-store approval and restore are distinct | Unavailable, failed purchase, failed restore and management errors are explicit | Retry, restore, close, support, store management |

The matrix is guarded by `verify-adaptive-state-contract.test.mjs` so a release
cannot silently remove the corresponding UI contracts.
