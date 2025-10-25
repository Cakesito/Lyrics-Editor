import LyricsEditor from "@/components/lyrics-editor/lyrics/main";
import WaveForm from "@/components/lyrics-editor/waveform/main";
import { LyricsEditorProvider } from "@/components/lyrics-editor/LyricsEditor";

export default function Home() {
  return (
    <LyricsEditorProvider>
      <div>
        <WaveForm />
        <LyricsEditor />
      </div>
    </LyricsEditorProvider>
  );
}
