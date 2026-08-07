/**
 * Exact eBible editions approved for pack BUILDING.
 *
 * This does not mean worldwide release approval. Production publishing remains
 * gated by the jurisdiction/rights review documented in global-scripture-rollout.md.
 */
export const EBIBLE_PACK_SOURCES = {
  ar: { id: 'arb-vd', edition: 'Arabic Van Dyck Bible' },
  my: { id: 'mya', edition: 'Burmese Common Language Bible' },
  cek: { id: 'cekak', edition: 'Asang Khongca Bible' },
  hlt: { id: 'hltmcsb', edition: 'Matupi Chin Standard Bible 2019' },
  'zh-Hans': { id: 'cmn-cu89s', edition: 'Chinese Union Version (simplified)' },
  'zh-Hant': { id: 'cmn-cu89t', edition: 'Chinese Union Version (traditional)' },
  hr: { id: 'hrv', edition: 'Croatian Bible' },
  cs: { id: 'ces1613', edition: 'Czech Kralická Bible 1613' },
  nl: { id: 'nld', edition: 'Dutch Bible 1917' },
  en: { id: 'engwebp', edition: 'World English Bible' },
  eo: { id: 'epo', edition: 'Esperanto Bible' },
  fr: { id: 'fraLSG', edition: 'Louis Segond 1910' },
  de: { id: 'deu1912', edition: 'Lutherbibel 1912' },
  ht: { id: 'hat', edition: 'Haitian Creole Bible 1985' },
  haw: { id: 'haw1868', edition: 'Hawaiian Bible 1868' },
  it: { id: 'ita1927', edition: 'Riveduta Bibbia 1927' },
  ja: { id: 'jpnm', edition: 'Japanese Freedom Bible 2026' },
  ko: { id: 'kor', edition: 'Korean Bible 1910' },
  kos: { id: 'kos', edition: 'Kosraean Bible 1928' },
  la: { id: 'latVUC', edition: 'Clementine Vulgate 1598' },
  ulk: { id: 'ulk1902', edition: 'Meriam Mir Bible 1902' },
  fa: { id: 'pesOPV', edition: 'Old Persian Version Bible 1895' },
  pt: { id: 'porbrbsl', edition: 'World Portuguese Bible' },
  ro: { id: 'ronbtf', edition: 'Romanian BTF Bible 2024' },
  'sr-Latn': { id: 'srp1865', edition: 'Serbian DK Bible (Latin)' },
  'sr-Cyrl': { id: 'srp1868', edition: 'Serbian DK Bible (Cyrillic)' },
  es: { id: 'spaRV1909', edition: 'Reina-Valera 1909' },
  sw: { id: 'swh1850', edition: 'Swahili Bible' },
  to: { id: 'ton', edition: 'Revised West Version 2014' },
  uk: { id: 'ukrfb', edition: 'Ukrainian Freedom Bible 2024' },
  vi: { id: 'vie1934', edition: 'Vietnamese Bible 1923' },
};

export const ebibleUsfxUrl = (id) => `https://ebible.org/Scriptures/${id}_usfx.zip`;
export const ebibleDetailsUrl = (id) => `https://ebible.org/details.php?id=${id}`;
