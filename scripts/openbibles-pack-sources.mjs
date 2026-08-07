export const OPEN_BIBLES_PACK_SOURCES = {
  sq: { file: 'sqi-albanian.osis.xml', format: 'osis', edition: 'Albanian Bible', rights: 'candidate-needs-review' },
  bg: { file: 'bul-bulgarian.osis.xml', format: 'osis', edition: 'Bulgarian Bible', rights: 'candidate-needs-review' },
  da: { file: 'dan-danish.osis.xml', format: 'osis', edition: 'Danish Bible', rights: 'candidate-needs-review' },
  fi: { file: 'fin-biblia.osis.xml', format: 'osis', edition: 'Finnish Bible', rights: 'candidate-needs-review' },
  hu: { file: 'hun-karoli.osis.xml', format: 'osis', edition: 'Hungarian Károli Bible', rights: 'candidate-needs-review' },
  lv: { file: 'lav-latvian.osis.xml', format: 'osis', edition: 'Latvian Bible', rights: 'candidate-needs-review' },
  mi: { file: 'mri-maori.osis.xml', format: 'osis', edition: 'Māori Bible', rights: 'candidate-needs-review' },
  no: { file: 'nor-norwegian.osis.xml', format: 'osis', edition: 'Norwegian Bible', rights: 'candidate-needs-review' },
  pl: { file: 'pol-gdanska.osis.xml', format: 'osis', edition: 'Biblia Gdańska', rights: 'candidate-needs-review' },
  sv: { file: 'swe-swedish.osis.xml', format: 'osis', edition: 'Swedish Bible', rights: 'candidate-needs-review' },
  tl: { file: 'tgl-tagalog.osis.xml', format: 'osis', edition: 'Ang Dating Biblia', rights: 'candidate-needs-review' },
  th: { file: 'tha-thai.osis.xml', format: 'osis', edition: 'Thai Bible', rights: 'candidate-needs-review' },
  tr: { file: 'tur-turkish.osis.xml', format: 'osis', edition: 'Turkish Bible public-domain candidate', rights: 'candidate-needs-review' },
  ru: { file: 'rus-synodal.zefania.xml', format: 'zefania', edition: 'Russian Synodal Translation', rights: 'verified-us-public-domain' },
};

export const openBiblesRawUrl = (file) =>
  `https://raw.githubusercontent.com/seven1m/open-bibles/master/${file}`;
export const openBiblesBlobUrl = (file) =>
  `https://github.com/seven1m/open-bibles/blob/master/${file}`;
