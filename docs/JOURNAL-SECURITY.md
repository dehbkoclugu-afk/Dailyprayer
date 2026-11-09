# Journal storage and recovery

On Android and iOS, journal entries and prayer requests are encrypted with AES-256-GCM before they are written to AsyncStorage. The random key is stored in the OS secure store with device-only accessibility. Other app state is not covered by this encryption.

An existing plaintext journal is read once, encrypted, and replaced in place. If key storage, encryption, or writing fails, the existing value remains in place and the app's storage-retry screen blocks later writes. Encrypted data without its key is never treated as an empty journal.

Android application backup is disabled. The device-only key is not portable to another device; a copied encrypted journal cannot be restored there. Uninstalling the app or losing the key may permanently remove access to entries. There is currently no journal export or account recovery. Do not claim that journal data survives device replacement.

The key is available while the device is unlocked. This does not add a separate in-app biometric lock. That option needs a dedicated UX and real-device testing, including canceled prompts and biometric enrollment changes.
