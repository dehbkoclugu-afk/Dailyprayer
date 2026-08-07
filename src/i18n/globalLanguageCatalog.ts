/**
 * Lumen global language / Scripture catalog.
 *
 * IMPORTANT:
 * - This is a rollout catalog, not a claim that every entry is globally public domain.
 * - "verified-us-public-domain" means eBible.org currently lists the edition in its
 *   Public Domain Bibles inventory (which explicitly scopes that statement to the USA).
 * - "candidate-needs-review" comes from the seven1m/open-bibles public-domain label
 *   and MUST pass a second rights + jurisdiction review before release.
 * - Scripture must never be machine-translated. Bible packs are built only from the
 *   named source edition and are checksum-pinned before publishing.
 *
 * Chinese and Serbian intentionally have two script variants, giving 45 locale tags
 * across 43 spoken/written languages.
 */
export const GLOBAL_LANGUAGE_CATALOG = [
  { tag: 'ar', language: 'Arabic', nativeName: 'العربية', direction: 'rtl', edition: 'Arabic Van Dyck Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'my', language: 'Burmese', nativeName: 'မြန်မာ', direction: 'ltr', edition: 'Burmese Common Language Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'cek', language: 'Chin, Eastern Khumi', nativeName: 'Eastern Khumi Chin', direction: 'ltr', edition: 'Asang Khongca Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'hlt', language: 'Chin, Matu', nativeName: 'Matu Chin', direction: 'ltr', edition: 'Matupi Chin Standard Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'zh-Hans', language: 'Chinese', nativeName: '简体中文', direction: 'ltr', edition: 'Chinese Union Version · Simplified', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'zh-Hant', language: 'Chinese', nativeName: '繁體中文', direction: 'ltr', edition: 'Chinese Union Version · Traditional', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'hr', language: 'Croatian', nativeName: 'Hrvatski', direction: 'ltr', edition: 'Croatian Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'cs', language: 'Czech', nativeName: 'Čeština', direction: 'ltr', edition: 'Czech Kralická Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'nl', language: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', edition: 'Dutch Bible 1917', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'en', language: 'English', nativeName: 'English', direction: 'ltr', edition: 'World English Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'eo', language: 'Esperanto', nativeName: 'Esperanto', direction: 'ltr', edition: 'Esperanto Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'fr', language: 'French', nativeName: 'Français', direction: 'ltr', edition: 'Louis Segond 1910', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'de', language: 'German', nativeName: 'Deutsch', direction: 'ltr', edition: 'Luther 1912', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ht', language: 'Haitian Creole', nativeName: 'Kreyòl ayisyen', direction: 'ltr', edition: 'Haitian Creole Bible 1985', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'haw', language: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', direction: 'ltr', edition: 'Hawaiian Bible 1868', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'it', language: 'Italian', nativeName: 'Italiano', direction: 'ltr', edition: 'Riveduta 1927', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ja', language: 'Japanese', nativeName: '日本語', direction: 'ltr', edition: 'Japanese Freedom Bible 2026', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ko', language: 'Korean', nativeName: '한국어', direction: 'ltr', edition: 'Korean Bible 1910', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'kos', language: 'Kosraean', nativeName: 'Kosraean', direction: 'ltr', edition: 'Kosraean Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'la', language: 'Latin', nativeName: 'Latina', direction: 'ltr', edition: 'Clementine Vulgate 1598', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ulk', language: 'Meriam', nativeName: 'Meriam Mir', direction: 'ltr', edition: 'Meriam Mir Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'fa', language: 'Persian', nativeName: 'فارسی', direction: 'rtl', edition: 'Old Persian Version Bible 1895', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'pt', language: 'Portuguese', nativeName: 'Português', direction: 'ltr', edition: 'World Portuguese Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ro', language: 'Romanian', nativeName: 'Română', direction: 'ltr', edition: 'Romanian BTF Bible 2024', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'ru', language: 'Russian', nativeName: 'Русский', direction: 'ltr', edition: 'Russian Synodal Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'sr-Latn', language: 'Serbian', nativeName: 'Srpski', direction: 'ltr', edition: 'Daničić–Karadžić Bible · Latin', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'sr-Cyrl', language: 'Serbian', nativeName: 'Српски', direction: 'ltr', edition: 'Daničić–Karadžić Bible · Cyrillic', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'es', language: 'Spanish', nativeName: 'Español', direction: 'ltr', edition: 'Reina-Valera 1909', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'sw', language: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', edition: 'Swahili Bible', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'to', language: 'Tongan', nativeName: 'Lea faka-Tonga', direction: 'ltr', edition: 'Revised West Version 2014', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'uk', language: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', edition: 'Ukrainian Freedom Bible 2024', source: 'ebible', rights: 'verified-us-public-domain' },
  { tag: 'vi', language: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', edition: 'Vietnamese Bible 1923', source: 'ebible', rights: 'verified-us-public-domain' },

  // These are strong public-domain candidates in seven1m/open-bibles, but are
  // intentionally blocked from release until independently re-verified.
  { tag: 'sq', language: 'Albanian', nativeName: 'Shqip', direction: 'ltr', edition: 'Albanian Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'bg', language: 'Bulgarian', nativeName: 'Български', direction: 'ltr', edition: 'Bulgarian Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'da', language: 'Danish', nativeName: 'Dansk', direction: 'ltr', edition: 'Danish Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'fi', language: 'Finnish', nativeName: 'Suomi', direction: 'ltr', edition: 'Finnish Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'hu', language: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', edition: 'Károli Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'lv', language: 'Latvian', nativeName: 'Latviešu', direction: 'ltr', edition: 'Latvian Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'mi', language: 'Māori', nativeName: 'Te reo Māori', direction: 'ltr', edition: 'Māori Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'no', language: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', edition: 'Norwegian Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'pl', language: 'Polish', nativeName: 'Polski', direction: 'ltr', edition: 'Biblia Gdańska 1881', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'sv', language: 'Swedish', nativeName: 'Svenska', direction: 'ltr', edition: 'Swedish Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'tl', language: 'Tagalog', nativeName: 'Tagalog', direction: 'ltr', edition: 'Ang Dating Biblia', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'th', language: 'Thai', nativeName: 'ไทย', direction: 'ltr', edition: 'Thai Bible', source: 'open-bibles', rights: 'candidate-needs-review' },
  { tag: 'tr', language: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', edition: 'Turkish Bible public-domain candidate', source: 'open-bibles', rights: 'candidate-needs-review' },
] as const;

export type GlobalLanguage = (typeof GLOBAL_LANGUAGE_CATALOG)[number];
export type GlobalLocaleTag = GlobalLanguage['tag'];
export type ScriptureRightsStatus = GlobalLanguage['rights'];

export const GLOBAL_LOCALE_TAGS = GLOBAL_LANGUAGE_CATALOG.map((item) => item.tag) as GlobalLocaleTag[];
export const RTL_LOCALE_TAGS: GlobalLocaleTag[] = GLOBAL_LANGUAGE_CATALOG
  .filter((item) => item.direction === 'rtl')
  .map((item) => item.tag);


/**
 * Exact eBible translation IDs verified from each edition detail page.
 * Russian is intentionally absent: the inventory link currently errors, so its
 * source ID must be re-verified instead of guessed.
 */
export const EBIBLE_SOURCE_IDS: Partial<Record<GlobalLocaleTag, string>> = {
  ar: 'arb-vd',
  my: 'mya',
  cek: 'cekak',
  hlt: 'hltmcsb',
  'zh-Hans': 'cmn-cu89s',
  'zh-Hant': 'cmn-cu89t',
  hr: 'hrv',
  cs: 'ces1613',
  nl: 'nld',
  en: 'engwebp',
  eo: 'epo',
  fr: 'fraLSG',
  de: 'deu1912',
  ht: 'hat',
  haw: 'haw1868',
  it: 'ita1927',
  ja: 'jpnm',
  ko: 'kor',
  kos: 'kos',
  la: 'latVUC',
  ulk: 'ulk1902',
  fa: 'pesOPV',
  pt: 'porbrbsl',
  ro: 'ronbtf',
  'sr-Latn': 'srp1865',
  'sr-Cyrl': 'srp1868',
  es: 'spaRV1909',
  sw: 'swh1850',
  to: 'ton',
  uk: 'ukrfb',
  vi: 'vie1934',
};

export function getEBibleUsfxUrl(tag: GlobalLocaleTag): string | null {
  const sourceId = EBIBLE_SOURCE_IDS[tag];
  return sourceId ? `https://ebible.org/Scriptures/${sourceId}_usfx.zip` : null;
}

export const RIGHTS_VERIFIED_LOCALE_TAGS: GlobalLocaleTag[] = GLOBAL_LANGUAGE_CATALOG
  .filter((item) => item.rights === 'verified-us-public-domain')
  .map((item) => item.tag);

/** Existing in-app UI translations. Other catalog entries must fall back to English until reviewed. */
export const CURRENT_UI_LOCALE_TAGS = ['en', 'tr', 'es', 'pt', 'fr', 'de'] as const;

/**
 * Current Turkish builds still ship YTC (CC BY-ND 4.0). The catalog's Turkish
 * public-domain candidate is a future replacement/additional pack and MUST NOT
 * be confused with the bundled YTC edition.
 */
export const EXISTING_NON_PD_SCRIPTURE = {
  tag: 'tr',
  edition: 'Yorumsuz Türkçe Çeviri (YTC)',
  license: 'CC BY-ND 4.0',
  derivativeTextAllowed: false,
} as const;
