/* eslint-disable  @typescript-eslint/no-explicit-any */

interface LyricLine {
  startTimeMs: string;
  words: string;
  syllables: any[];
  endTimeMs: string;
}

interface Lyrics {
  syncType: string;
  lines: LyricLine[];
  provider: string;
  providerLyricsId: string;
  providerDisplayName: string;
  syncLyricsUri: string;
  isDenseTypeface: boolean;
  alternatives: any[];
  language: string;
  isRtlLanguage: boolean;
  capStatus: string;
  previewLines: LyricLine[];
}

interface Colors {
  background: number;
  text: number;
  highlightText: number;
}

interface LyricsResponse {
  lyrics: Lyrics;
  colors: Colors;
  hasVocalRemoval: boolean;
}

type LyricLineType = "primary" | "secondary";

interface EditingLyricLine {
  type: LyricLineType;
  start: number;
  words: string;
  end: number;
}

export type {
  LyricLine,
  Lyrics,
  Colors,
  LyricsResponse,
  LyricLineType,
  EditingLyricLine
};
