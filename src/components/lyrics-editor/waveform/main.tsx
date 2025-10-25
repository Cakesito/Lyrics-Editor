"use client";

import WaveSurfer from "wavesurfer.js";
import UploadAudio from "./uploadAudio";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLyricsEditor, useLyricsEditorContext } from "../LyricsEditor";
import { KeyboardAudioController } from "./KeyboardController";

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${formattedSeconds}:${milliseconds}`;
};

export default function WaveForm() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const { initializeWavesurfer, destroyWavesurfer } = useLyricsEditorContext();

  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [zoom, setZoom] = useState(0);

  const { currentTime } = useLyricsEditor();

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#007bff",
      progressColor: "#0056b3",
      height: 200,
      minPxPerSec: 0,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setIsReady(true);
    });

    ws.on("timeupdate", () => {
      setPlaybackRate(ws.getPlaybackRate());
    });

    ws.on("zoom", (newZoom) => {
      setZoom(newZoom);
    });

    ws.on("error", (error) => {
      console.error("WaveSurfer error:", error);
      setIsReady(false);
    });

    initializeWavesurfer(ws);

    return () => {
      if (wavesurferRef.current) wavesurferRef.current = null;
      destroyWavesurfer();
      setIsReady(false);
    };
  }, []);

  const handleAudioUpload = useCallback((file: File) => {
    if (!wavesurferRef.current) return;

    const url = URL.createObjectURL(file);
    const ws = wavesurferRef.current;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      ws.un("ready", cleanup);
      ws.un("error", cleanup);
    };

    ws.on("ready", cleanup);
    ws.on("error", cleanup);

    ws.load(url);
  }, []);

  return (
    <div>
      <KeyboardAudioController isReady={isReady} />
      <UploadAudio onUpload={handleAudioUpload} />
      <div ref={waveformRef}></div>
      <span>
        {formatTime(currentTime)} / {formatTime(Math.round(duration * 1000))}
      </span>
      <br />
      <span>{Math.round(playbackRate * 10) / 10}x</span>
      <br />
      <span>{zoom}</span>
    </div>
  );
}
