// Public-domain SWORD modules used only when the raw eBible/Open Bibles corpus is incomplete.
// Rights are pinned to each module's CrossWire ModInfo page. These still need a structural
// extraction pass before they can become production download packs.
export const CROSSWIRE_PD_FALLBACKS = {
  da: { module: 'DaOT1871NT1907', edition: 'Danish OT 1871 + NT 1907', upstreamLocale: 'da' },
  lv: { module: 'LvGluck8', edition: 'Latvian Glück 8th edition', upstreamLocale: 'lv' },
  no: { module: 'Norsk', edition: 'Bibelen på Norsk (1930)', upstreamLocale: 'nb' },
  pl: { module: 'PolGdanska', edition: 'Biblia Gdańska (1881)', upstreamLocale: 'pl' },
  sv: { module: 'Swe1917', edition: 'Swedish Bible (1917)', upstreamLocale: 'sv' },
  ko: { module: 'KorRV', edition: 'Korean Revised Version (1952/1961)', upstreamLocale: 'ko' },
};

export const crossWireInfoUrl = (module) =>
  `https://www.crosswire.org/sword/modules/ModInfo.jsp?modName=${module}`;
export const crossWireRawZipUrl = (module) =>
  `https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/${module}.zip`;
