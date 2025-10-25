import { useEffect, useCallback } from "react";
import { useLyricsEditor } from "../LyricsEditor";

/**
 * Keyboard shortcuts for the lyrics editor
 */
const SHORTCUTS = {
  SET_START_TIME: "q",
  SET_END_TIME: "e",
  START_TIME_UP: "d",
  START_TIME_DOWN: "a",
  END_TIME_UP: "D",
  END_TIME_DOWN: "A",
  SELECTED_LINE_UP: "w",
  SELECTED_LINE_DOWN: "s",
  TOGGLE_LINE_TYPE: "x",
  UNDO: "z", // plus ctrl
  REDO: "Z", // plus ctrl
} as const;

export const KeyboardLyricsController = () => {
  const { currentTime, updateSelectedIndex, updateSelectedLine, undo, redo } =
    useLyricsEditor();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const TIME_STEP = 100;

    switch (event.key) {
      case SHORTCUTS.SET_START_TIME:
        updateSelectedLine({ start: currentTime });
        break;

      case SHORTCUTS.SET_END_TIME:
        updateSelectedLine({ end: currentTime });
        break;

      case SHORTCUTS.START_TIME_UP:
        updateSelectedLine((prev) => ({
          ...prev,
          start: prev.start + TIME_STEP,
        }));
        break;

      case SHORTCUTS.START_TIME_DOWN:
        updateSelectedLine((prev) => ({
          ...prev,
          start: Math.max(0, prev.start - TIME_STEP),
        }));
        break;

      case SHORTCUTS.END_TIME_UP:
        updateSelectedLine((prev) => ({
          ...prev,
          end: prev.end + TIME_STEP,
        }));
        break;

      case SHORTCUTS.END_TIME_DOWN:
        updateSelectedLine((prev) => ({
          ...prev,
          end: Math.max(0, prev.end - TIME_STEP),
        }));
        break;

      case SHORTCUTS.SELECTED_LINE_UP:
        updateSelectedIndex((prev) => prev - 1, true);
        break;

      case SHORTCUTS.SELECTED_LINE_DOWN:
        updateSelectedIndex((prev) => prev + 1, true);
        break;

      case SHORTCUTS.TOGGLE_LINE_TYPE:
        updateSelectedLine((prev) => ({
          ...prev,
          type: prev.type === "primary" ? "secondary" : "primary",
        }));
        break;

      case SHORTCUTS.UNDO:
        if (event.ctrlKey) undo();
        break;

      case SHORTCUTS.REDO:
        if (event.ctrlKey && event.shiftKey) redo(); // Ctrl+Shift+Z
        break;

      default:
        break;
    }
  }, [currentTime, updateSelectedIndex, updateSelectedLine, undo, redo]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
};
