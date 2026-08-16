import { resolveWebAudioChapterUrl } from './webAudioBible.ts';
import { resolveEbibleChapterUrl, resolveFrenchChapterUrl, resolveSermonOnlineChapterUrl, resolveSpanishChapterUrl } from './publicDomainAudioProviders.ts';

export interface ScriptureAudioSource {
  id: string;
  locale: string;
  edition: string;
  label: string;
  attribution: string;
  rights: string;
  evidenceUrl: string;
  trustedHosts: readonly string[];
  coverage: string;
  resolveChapterUrl: (bookIndex: number, chapterIndex: number, fetcher?: typeof fetch) => Promise<string>;
}

const sermon = (baseUrl: string) => (book: number, chapter: number, fetcher?: typeof fetch) => resolveSermonOnlineChapterUrl(baseUrl, book, chapter, fetcher);

const SOURCES: ScriptureAudioSource[] = [
  { id: 'web-henson', locale: 'en', edition: 'World English Bible', label: 'WEB Audio Bible', attribution: 'Winfred W. Henson', rights: 'Public domain', evidenceUrl: 'https://ebible.org/eng-web/copyright.htm', trustedHosts: ['ebible.org'], coverage: 'Complete Bible · 1,189 chapters', resolveChapterUrl: resolveWebAudioChapterUrl },
  { id: 'ytc-ebible', locale: 'tr', edition: 'Yorumsuz Türkçe Çeviri (YTC)', label: 'Türkçe YTC Sesli Kutsal Kitap', attribution: 'İsmail Serinken and eBible.org', rights: 'CC BY-ND 4.0', evidenceUrl: 'https://ebible.org/turytc/copyright.htm', trustedHosts: ['ebible.org'], coverage: 'Complete Bible · 1,189 chapters', resolveChapterUrl: async (book, chapter) => resolveEbibleChapterUrl('turytc', book, chapter) },
  { id: 'rv1909-pdab', locale: 'es', edition: 'Reina-Valera 1909', label: 'Reina-Valera 1909 Audio', attribution: 'PublicDomainAudioBibles.com', rights: 'Public domain recording (2017)', evidenceUrl: 'https://publicdomainaudiobibles.com/RVA1909.html', trustedHosts: ['publicdomainaudiobibles.com', 'www.publicdomainaudiobibles.com'], coverage: 'Complete Bible · 1,189 chapters', resolveChapterUrl: resolveSpanishChapterUrl },
  { id: 'lsg1910-archive', locale: 'fr', edition: 'Louis Segond 1910', label: 'Bible audio Louis Segond 1910', attribution: 'Internet Archive / WordProject', rights: 'Public Domain Mark 1.0', evidenceUrl: 'https://archive.org/details/french_audiobible', trustedHosts: ['archive.org'], coverage: 'Complete Bible · 1,189 chapters', resolveChapterUrl: resolveFrenchChapterUrl },
  { id: 'luther1912-sermon', locale: 'de', edition: 'Lutherbibel 1912', label: 'Luther 1912 Hörbibel', attribution: 'Sermon-Online', rights: 'Gemeinfrei', evidenceUrl: 'https://www.sermon-online.com/contents/879', trustedHosts: ['info2.sermon-online.com'], coverage: 'Complete Bible · 1,189 chapters', resolveChapterUrl: sermon('https://info2.sermon-online.com/german/MartinLuther-1912/Audio_Bibel_Luther_Uebersetzung_1912_OT_NT_MP3/') },
];

// Japanese audio intentionally stays out of the production registry until the
// recording's exact edition and paid-product usage rights are confirmed.

export function getScriptureAudioSource(edition: string): ScriptureAudioSource | null {
  return SOURCES.find((source) => source.edition === edition) ?? null;
}

export async function resolveScriptureAudioChapterUrl(edition: string, bookIndex: number, chapterIndex: number, fetcher?: typeof fetch): Promise<string> {
  const source = getScriptureAudioSource(edition);
  if (!source) throw new Error('Audio edition unavailable');
  const url = await source.resolveChapterUrl(bookIndex, chapterIndex, fetcher);
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !source.trustedHosts.includes(parsed.hostname)) throw new Error('Untrusted audio URL');
  return parsed.href;
}
