// structuralStatus reflects the exact upstream file after the 66-book/chapter gate.
// It is deliberately separate from rights review: text completeness is not a license grant.
export const OPEN_BIBLES_PACK_SOURCES = {
  sq: { file: 'sqi-albanian.osis.xml', format: 'osis', edition: 'Albanian Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  bg: { file: 'bul-bulgarian.osis.xml', format: 'osis', edition: 'Bulgarian Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  da: { file: 'dan-danish.osis.xml', format: 'osis', edition: 'Danish Bible', rights: 'candidate-needs-review', structuralStatus: 'blocked', blocker: 'missing Psalm 100; use CrossWire PD fallback' },
  fi: { file: 'fin-biblia.osis.xml', format: 'osis', edition: 'Finnish Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  hu: { file: 'hun-karoli.osis.xml', format: 'osis', edition: 'Hungarian Károli Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  lv: { file: 'lav-latvian.osis.xml', format: 'osis', edition: 'Latvian Bible', rights: 'candidate-needs-review', structuralStatus: 'blocked', blocker: 'New Testament only; use CrossWire PD fallback' },
  mi: { file: 'mri-maori.osis.xml', format: 'osis', edition: 'Māori Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  no: { file: 'nor-norwegian.osis.xml', format: 'osis', edition: 'Norwegian Bible', rights: 'candidate-needs-review', structuralStatus: 'blocked', blocker: 'missing canonical books; use CrossWire PD fallback' },
  pl: { file: 'pol-gdanska.osis.xml', format: 'osis', edition: 'Biblia Gdańska', rights: 'candidate-needs-review', structuralStatus: 'blocked', blocker: 'corrupt/misordered Chronicles; use CrossWire PD fallback' },
  sv: { file: 'swe-swedish.osis.xml', format: 'osis', edition: 'Swedish Bible', rights: 'candidate-needs-review', structuralStatus: 'blocked', blocker: 'missing 1 Peter 4; use CrossWire PD fallback' },
  tl: { file: 'tgl-tagalog.osis.xml', format: 'osis', edition: 'Ang Dating Biblia', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  th: { file: 'tha-thai.osis.xml', format: 'osis', edition: 'Thai Bible', rights: 'candidate-needs-review', structuralStatus: 'pass' },
  tr: { file: 'tur-turkish.osis.xml', format: 'osis', edition: 'Rejected Turkish source', rights: 'rejected-source-mismatch', structuralStatus: 'blocked', blocker: 'text matches copyrighted modern Kutsal Kitap Yeni Çeviri and also lacks Obadiah' },
  ru: { file: 'rus-synodal.zefania.xml', format: 'zefania', edition: 'Russian Synodal Translation', rights: 'verified-us-public-domain', structuralStatus: 'pass' },
};

export const openBiblesRawUrl = (file) =>
  `https://raw.githubusercontent.com/seven1m/open-bibles/master/${file}`;
export const openBiblesBlobUrl = (file) =>
  `https://github.com/seven1m/open-bibles/blob/master/${file}`;
