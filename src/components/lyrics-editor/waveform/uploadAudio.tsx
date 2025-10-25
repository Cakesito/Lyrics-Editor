import React from "react";

const UploadAudio = ({ onUpload }: { onUpload: (file: File) => void }) => {
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div>
      <label htmlFor="audioUpload">Subir archivo de audio:</label>
      <input
        id="audioUpload"
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
      />
    </div>
  );
};

export default UploadAudio;
