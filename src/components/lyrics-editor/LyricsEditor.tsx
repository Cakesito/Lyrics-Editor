"use client";

import type WaveSurfer from "wavesurfer.js";
import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import type { EditingLyricLine, LyricLineType } from "./types";

export function useLyricsEditor() {
  const {
    wavesurfer,
    lyrics,
    setLyrics,
    currentTime,
    setCurrentTime,
    selectedIndex,
    setSelectedIndex,
    autoIndex,
    setAutoIndex,
    history,
    setHistory,
    redoStack,
    setRedoStack,
  } = useLyricsEditorContext();

  const handleTimeUpdate = useCallback((time: number) =>
    setCurrentTime(Math.round(time * 1000)),
    [setCurrentTime]
  );

  const updateSelectedIndex = useCallback(
    (
      newIndex: number | ((prev: number) => number),
      cancelAutoIndex = false,
    ) => {
      setSelectedIndex((current) => {
        const nextIndex =
          typeof newIndex === "function" ? newIndex(current) : newIndex;

        if (nextIndex < 0 || nextIndex >= lyrics.length) return current;

        if (cancelAutoIndex) setAutoIndex(false);
        return nextIndex;
      });
    },
    [lyrics.length, setSelectedIndex, setAutoIndex],
  );

  const isLineActive = useCallback(
    (line: EditingLyricLine) =>
      currentTime >= line.start && (line.end === 0 || currentTime <= line.end),
    [currentTime],
  );

  const checkSelectedIndex = useCallback(() => {
    const primaryIndex = lyrics.findLastIndex(
      (line) => line.type === "primary" && isLineActive(line),
    );

    // if autoIndex is on and we have an active primary line, select it
    // if the manually selected the line becomes active, re-enable autoIndex
    if (autoIndex && primaryIndex !== -1) {
      updateSelectedIndex(primaryIndex);
    } else if (primaryIndex === selectedIndex && primaryIndex !== -1) {
      setAutoIndex(true);
    }
  }, [
    lyrics,
    isLineActive,
    updateSelectedIndex,
    selectedIndex,
    autoIndex,
    setAutoIndex,
  ]);

  useEffect(() => {
    if (!wavesurfer) return;

    handleTimeUpdate(wavesurfer.getCurrentTime());
    wavesurfer.on("timeupdate", handleTimeUpdate);

    return () => wavesurfer.un("timeupdate", handleTimeUpdate);
  }, [wavesurfer, handleTimeUpdate]);

  useEffect(() => {
    checkSelectedIndex();
  }, [currentTime, checkSelectedIndex]);

  const updateLyrics = useCallback(
    (
      newLyrics:
        | EditingLyricLine[]
        | ((prev: EditingLyricLine[]) => EditingLyricLine[]),
    ) => {
      setLyrics((current) => {
        const nextLyrics =
          typeof newLyrics === "function" ? newLyrics(current) : newLyrics;

        if (JSON.stringify(current) !== JSON.stringify(nextLyrics)) {
          setHistory((prev) => [...prev, current]);
          setRedoStack([]);
        }

        return nextLyrics;
      });
    },
    [setLyrics, setHistory, setRedoStack],
  );

  const updateLyricLine = useCallback(
    (
      index: number,
      updatedLine:
        | Partial<EditingLyricLine>
        | ((prev: EditingLyricLine) => EditingLyricLine),
    ) => {
      const targetLine = lyrics[index];
      if (!targetLine) return;

      updateLyrics((current) => {
        const updatedLyrics = [...current];

        if (typeof updatedLine === "function") {
          updatedLyrics[index] = updatedLine(current[index]);
        } else {
          const lineType = updatedLine.type || current[index].type || "primary";
          updatedLyrics[index] = {
            ...current[index],
            ...updatedLine,
            type: lineType as LyricLineType,
          };
        }

        return updatedLyrics;
      });
    },
    [updateLyrics, lyrics],
  );

  const updateSelectedLine = useCallback(
    (
      updatedLine:
        | Partial<EditingLyricLine>
        | ((prev: EditingLyricLine) => EditingLyricLine),
    ) => {
      if (selectedIndex < 0 || selectedIndex >= lyrics.length) return;
      updateLyricLine(selectedIndex, updatedLine);

      // disable autoIndex when manually editing a line
      if (autoIndex) setAutoIndex(false);
    },
    [updateLyricLine, selectedIndex, lyrics, autoIndex, setAutoIndex],
  );

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return false;

    setHistory((prev) => {
      const newHistory = [...prev];
      const lastState = newHistory.pop() || [];

      if (lastState.length > 0) {
        setRedoStack((current) => [lyrics, ...current]);
        setLyrics(lastState);
      }

      return newHistory;
    });

    return true;
  }, [canUndo, lyrics, setHistory, setRedoStack, setLyrics]);

  const redo = useCallback(() => {
    if (!canRedo) return false;

    setRedoStack((prev) => {
      const newRedoStack = [...prev];
      const nextState = newRedoStack.shift() || [];

      if (nextState.length > 0) {
        setHistory((current) => [...current, lyrics]);
        setLyrics(nextState);
      }

      return newRedoStack;
    });

    return true;
  }, [canRedo, lyrics, setRedoStack, setHistory, setLyrics]);

  const activePrimaryIndex = useMemo(
    () =>
      lyrics.findLastIndex(
        (line) => line.type === "primary" && isLineActive(line),
      ),
    [lyrics, isLineActive],
  );

  const activeSecondaryIndices = useMemo(
    () =>
      lyrics
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => line.type === "secondary" && isLineActive(line))
        .map(({ index }) => index),
    [lyrics, isLineActive],
  );

  return {
    lyrics,
    currentTime,
    selectedIndex,
    autoIndex,

    activePrimaryIndex,
    activeSecondaryIndices,
    canUndo,
    canRedo,

    updateLyrics,
    updateLyricLine,
    updateSelectedLine,
    updateSelectedIndex,
    undo,
    redo,
  };
}

interface LyricsEditorContextType {
  wavesurfer: WaveSurfer | null;
  lyrics: EditingLyricLine[];
  setLyrics: Dispatch<SetStateAction<EditingLyricLine[]>>;
  currentTime: number;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  autoIndex: boolean;
  setAutoIndex: Dispatch<SetStateAction<boolean>>;
  history: EditingLyricLine[][];
  setHistory: Dispatch<SetStateAction<EditingLyricLine[][]>>;
  redoStack: EditingLyricLine[][];
  setRedoStack: Dispatch<SetStateAction<EditingLyricLine[][]>>;
  initializeWavesurfer: (ws: WaveSurfer) => void;
  destroyWavesurfer: () => void;
}

const LyricsEditorContext = createContext<LyricsEditorContextType | null>(null);

export const useLyricsEditorContext = () => {
  const context = useContext(LyricsEditorContext);
  if (!context) {
    throw new Error(
      "useLyricsEditorContext debe ser usado dentro de un LyricsEditorProvider",
    );
  }
  return context;
};

export function LyricsEditorProvider({ children }: { children?: ReactNode }) {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);

  const [lyrics, setLyrics] = useState<EditingLyricLine[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoIndex, setAutoIndex] = useState(true);
  const [history, setHistory] = useState<EditingLyricLine[][]>([]);
  const [redoStack, setRedoStack] = useState<EditingLyricLine[][]>([]);

  const initializeWavesurfer = useCallback((ws: WaveSurfer) => {
    setWavesurfer(ws);
  }, []);

  const destroyWavesurfer = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.destroy();
      setWavesurfer(null);
    }
  }, [wavesurfer]);

  const value: LyricsEditorContextType = {
    wavesurfer,
    initializeWavesurfer,
    destroyWavesurfer,
    lyrics,
    setLyrics,
    currentTime,
    setCurrentTime,
    selectedIndex,
    setSelectedIndex,
    autoIndex,
    setAutoIndex,
    history,
    setHistory,
    redoStack,
    setRedoStack,
  };

  return (
    <LyricsEditorContext.Provider value={value}>
      {children}
    </LyricsEditorContext.Provider>
  );
}
