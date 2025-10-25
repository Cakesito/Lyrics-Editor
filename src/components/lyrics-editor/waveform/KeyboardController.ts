import { useEffect } from "react";
import { useLyricsEditorContext } from "../LyricsEditor";

const SHORTCUTS = {
  SKIP_FORWARD: "l",
  SKIP_BACKWARD: "j",
  PLAY_PAUSE: "k",
  STOP: "r",
  SPEED_UP: ".",
  SPEED_DOWN: ",",
  ZOOM_IN: "+",
  ZOOM_OUT: "-",
} as const;

const CONFIG = {
  ZOOM_MIN: 0,
  ZOOM_MAX: 150,
  ZOOM_STEP: 5,
  SPEED_STEP: 0.1,
} as const;

export const KeyboardAudioController = ({
  isReady,
}: {
  isReady: boolean;
}) => {
  const { wavesurfer: ws } = useLyricsEditorContext();

  useEffect(() => {
    if (!ws) return;
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  if (!ws) return;
  const zoom = ws.options.minPxPerSec;

  const calculateSkip = (forward: boolean) => {
    const change = (-(5 / 160) * zoom + 5);
    return forward ? change : -change;
  }

  const changeZoomBy = (amount: number) => {
    if (!isReady) return;

    const newZoom = zoom + amount;

    if (newZoom > CONFIG.ZOOM_MAX) {
      if (zoom != CONFIG.ZOOM_MAX) return ws.zoom(CONFIG.ZOOM_MAX);
      return;
    }

    if (newZoom < CONFIG.ZOOM_MIN) {
      if (zoom != CONFIG.ZOOM_MIN) return ws.zoom(CONFIG.ZOOM_MIN);
      return;
    }

    ws.zoom(newZoom);
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isReady) return;

    switch (event.key) {
      case SHORTCUTS.SKIP_FORWARD:
        ws.skip(calculateSkip(true));
        break;

      case SHORTCUTS.SKIP_BACKWARD:
        ws.skip(calculateSkip(false));
        break;

      case SHORTCUTS.PLAY_PAUSE:
        ws.playPause();
        break;

      case SHORTCUTS.STOP:
        ws.stop();
        break;

      case SHORTCUTS.SPEED_UP:
        ws.setPlaybackRate(ws.getPlaybackRate() + CONFIG.SPEED_STEP);
        break;

      case SHORTCUTS.SPEED_DOWN:
        ws.setPlaybackRate(ws.getPlaybackRate() - CONFIG.SPEED_STEP);
        break;

      case SHORTCUTS.ZOOM_IN:
        changeZoomBy(CONFIG.ZOOM_STEP);
        break;

      case SHORTCUTS.ZOOM_OUT:
        changeZoomBy(-CONFIG.ZOOM_STEP);
        break;

      default:
        break;
    }
  };

  return null;
};
