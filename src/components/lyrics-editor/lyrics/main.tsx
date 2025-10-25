"use client";

import UploadLyrics from "./uploadLyrics";
import { cn } from "@/lib/utils";
import { useState, memo, useMemo, useCallback } from "react";
import { useLyricsEditor } from "../LyricsEditor";
import { KeyboardLyricsController } from "./KeyboardController";
import type { EditingLyricLine, LyricLine } from "../types";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${formattedSeconds}:${milliseconds}`;
};

const Line = memo(({
  line,
  isActive,
}: {
  line: EditingLyricLine;
  isActive: boolean;
}) => {
  const isPrimary = line.type === "primary";
  const isSecondary = line.type === "secondary";

  return (
    <div>
      <span className="text-2xl text-gray-500 w-24">{formatTime(line.start)}</span>
      <span
        className={cn(
          "mx-2",
          isPrimary ? "" : "text-gray-500 italic",
          isActive && isPrimary && "text-red-700 font-semibold",
          isActive && isSecondary && "text-gray-700 font-semibold"
        )}
      >
        {line.words}
      </span>
      <span className="text-2xl text-gray-500 w-24">{formatTime(line.end)}</span>
    </div>
  );
});

Line.displayName = "Line";

export default function LyricsEditor() {
  const {
    lyrics,
    updateLyrics,
    updateLyricLine,
    selectedIndex,
    activePrimaryIndex,
    activeSecondaryIndices,
  } = useLyricsEditor();

  const [textarea, setTextarea] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleTextareaChange = useCallback((text: string) => setTextarea(text), []);

  // Processes synced lyrics from the provider
  const handleSyncedLyrics = useCallback((rawLyrics: LyricLine[]) => {
    const fixedLyrics = rawLyrics
      .filter(line => line.words.trim() !== "")
      .map(line => ({
        start: Number(line.startTimeMs),
        words: line.words,
        end: Number(line.endTimeMs),
        type: "primary" as const,
      }));

    const lyricsText = fixedLyrics
      .map(line => line.words)
      .join('\n');

    updateLyrics(fixedLyrics);
    setTextarea(lyricsText);
  }, [updateLyrics]);

  const handleEditingToggle = useCallback(() => {
    // no synced lyrics exist
    if (lyrics.length === 0) {
      const newLyrics: EditingLyricLine[] = textarea
        .split("\n")
        .filter(line => line.trim().length > 0)
        .map(line => ({
          start: 0,
          words: line,
          end: 0,
          type: "primary" as const,
        }));

      updateLyrics(newLyrics);
    }

    // user modified lyrics after syncing
    else if (lyrics.length > 0) {
      setTextarea((text) => text.replace(/^\s*$/gim, ""));
      const lines = textarea.split("\n");

      // only update if number of lines matches
      if (lines.length === lyrics.length) {
        lines.forEach((lineText, i) => {
          if (i < lyrics.length && lyrics[i].words !== lineText) {
            updateLyricLine(i, { words: lineText });
          }
        });
      }
    }

    setIsEditing(prev => !prev);
  }, [lyrics, textarea, updateLyrics, updateLyricLine]);

  const checkValidLyrics = useMemo(() => (): {
        isValid: boolean;
        invalidLines: {
          lines: EditingLyricLine[];
          reason: string;
        }[];
      } => {
        const invalidLines: {
          lines: EditingLyricLine[];
          reason: string;
        }[] = [];
        let isValid = true;

        const primaryLines = lyrics.map((line, index) => ({ line, index }))
          .filter(({ line }) => line.type === "primary");

        primaryLines.forEach((current, i) => {
          const nextPrimary = i + 1 < primaryLines.length ? primaryLines[i + 1] : null;

          if (nextPrimary && current.line.end > nextPrimary.line.start) {
            isValid = false;
            invalidLines.push({
              lines: [current.line, nextPrimary.line],
              reason: `Primary line ${current.index} end > primary line ${nextPrimary.index} start`,
            });
          }
        });

        lyrics.forEach((line, i) => {
        if (line.start > line.end && line.end !== 0) {
          isValid = false;
          invalidLines.push({
            lines: [line],
            reason: `Line ${i} start > end`,
          });
        }
      });

    return { isValid, invalidLines };
  }, [lyrics]);

  return (
    <div>
      <KeyboardLyricsController />
      <UploadLyrics
        timestamps={handleSyncedLyrics}
        onLyricChange={handleTextareaChange}
        hidden={isEditing}
      />

      <button onClick={handleEditingToggle}>
        {isEditing ? "Edit Lyrics" : "Start"}
      </button>

      <div className="overflow-hidden max-h-[60vh]">
        <div
          className="text-3xl text-center"
          style={{
            transform: `translateY(-${(selectedIndex > 3 ? selectedIndex - 3 : 0) * 40}px)`,
          }}
        >

          {isEditing && lyrics.map((line, i) => {
            const isSelected = selectedIndex === i;
            const isActive = line.type === "primary"
              ? activePrimaryIndex === i
              : activeSecondaryIndices?.includes(i);

            return (
              <div
                key={`line_${i}`}
                className={cn(
                  "border-l-6",
                  isSelected ? "bg-gray-300 py-1 my-0.5 text-[2.1rem]" : "my-1",

                  line.type === "secondary" && !isActive && "border-gray-400",
                  line.type === "secondary" && isActive && "border-gray-700",
                  line.type === "primary" && isActive && "border-red-500",
                )}
              >
                <Line line={line} isActive={isActive} />
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          const validation = checkValidLyrics();
          if (validation.isValid) {
            navigator.clipboard.writeText(JSON.stringify(lyrics));
            alert("Lyrics saved to clipboard!");
          } else {
            alert("Invalid lyrics detected. Check validation details in clipboard.");
            navigator.clipboard.writeText(JSON.stringify(validation));
          }
        }}
      >
        Save
      </button>
    </div>
  )
}
