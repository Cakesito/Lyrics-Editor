"use client";

import { useRef, useState, memo, useCallback } from "react";
import type { LyricLine, LyricsResponse } from "../types";

/* const example: LyricsResponse = {
  lyrics: {
    syncType: "LINE_SYNCED",
    lines: [
      {
        startTimeMs: "20680",
        words: "Salt on the glass",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "22840",
        words: "Coke on the knife",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "24760",
        words: "Is there anything left to escape but life?",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "28650",
        words: "I didn\u0027t sign, I didn\u0027t sign up for this",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "36350",
        words: "May today lose what yesterday won",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "40300",
        words: "Hope that tomorrow I\u0027ll get something done",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "44270",
        words: "I\u0027m gonna run, I\u0027m gonna run out of time",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "52110",
        words: "But I\u0027ll tell you what, I\u0027m not afraid to die",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "55870",
        words: "I\u0027m more afraid of what might happen first",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "59940",
        words: "Either way, it\u0027s not like we\u0027ll get out alive",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "63790",
        words: "I can\u0027t that say I know which one is worse",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "67810",
        words: "Everything\u0027s useless, especially songs",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "71750",
        words: "I think the truth is that everyone\u0027s wrong",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "75730",
        words: "Still sing along, still sing a long, long time",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "83610",
        words: "I might keep looking for nothing to find",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "87560",
        words: "They say keep trucking, it\u0027s all in your mind",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "91370",
        words: "Jimmy, you\u0027re fine",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "93360",
        words: "End of the line gaining speed",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "96420",
        words: "Wrapping trees",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "99170",
        words: "But I\u0027ll tell you what, I\u0027m not afraid to die",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "103020",
        words: "I\u0027m more afraid of what might happen first",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "107100",
        words: "Either way, it\u0027s not like we\u0027ll get out alive",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "110930",
        words: "I can\u0027t say that I know which one is worse",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "113720",
        words: "Take it away, man",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "114930",
        words: "♪",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "130480",
        words: "But I\u0027ll tell you what, I\u0027m not afraid to die",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "134200",
        words: "I\u0027m more afraid of what might happen first",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "138200",
        words: "Either way, it\u0027s not like we\u0027ll get out alive",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "142010",
        words: "I can\u0027t say that I know which one is worse",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "147920",
        words: "",
        syllables: [],
        endTimeMs: "0",
      },
    ],
    provider: "MusixMatch",
    providerLyricsId: "107945820",
    providerDisplayName: "Musixmatch",
    syncLyricsUri: "",
    isDenseTypeface: false,
    alternatives: [],
    language: "en",
    isRtlLanguage: false,
    capStatus: "UNCAPPED",
    previewLines: [
      {
        startTimeMs: "20680",
        words: "Salt on the glass",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "22840",
        words: "Coke on the knife",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "24760",
        words: "Is there anything left to escape but life?",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "28650",
        words: "I didn\u0027t sign, I didn\u0027t sign up for this",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "36350",
        words: "May today lose what yesterday won",
        syllables: [],
        endTimeMs: "0",
      },
    ],
  },
  colors: {
    background: -15301055,
    text: -16777216,
    highlightText: -1,
  },
  hasVocalRemoval: false,
}; */

const UploadLyrics = memo(({
  onLyricChange,
  timestamps,
  ...props
}: React.ComponentProps<"div"> & {
  onLyricChange: (lyrics: string) => void;
  timestamps: (lines: LyricLine[]) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [text, setText] = useState("");
  const [trackId, setTrackId] = useState("");

  const handleTrackIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTrackId(event.target.value);
  }, []);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setText(newText);
    onLyricChange(newText);
  }, [onLyricChange]);

  const handleLyricsSearch = useCallback(async () => {
    try {
      const res = await fetch(`/api/spotify?track=${trackId}`);
      const data: LyricsResponse = await res.json();
      // const data = example;

      // Build lyrics text and ensure all lines have required properties
      const lyrics = data.lyrics.lines
        .map(line => line.words)
        .join('\n');

      // Process lines with type property
      const processedLines = data.lyrics.lines.map((line: LyricLine) => ({
        ...line,
        type: "primary" as const
      }));

      setText(lyrics);
      timestamps(processedLines);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
    }
  }, [trackId, timestamps]);

  return (
    <div {...props} className="w-[45%] h-[40vh]">
      <div className="flex flex-col gap-2">
        <textarea
          ref={textareaRef}
          onChange={handleTextChange}
          value={text}
          placeholder="Enter lyrics or search by track ID"
          className="border w-full h-[30vh] p-2 resize-none"
        />
        <div className="flex gap-2 items-center">
          <input
            onChange={handleTrackIdChange}
            value={trackId}
            placeholder="Enter track ID"
            className="border p-2 flex-grow"
          />
          <button
            onClick={handleLyricsSearch}
          >
            Look up
          </button>
        </div>
      </div>
    </div>
  );
});

UploadLyrics.displayName = "UploadLyrics";

export default UploadLyrics;
