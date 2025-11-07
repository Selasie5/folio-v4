
"use client";

import { useEffect, useRef } from "react";

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;       
      const playAudio = () => {
        audio.play().catch(() => {});
        window.removeEventListener("click", playAudio);
      };
      window.addEventListener("click", playAudio);
    }
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/sounds/ambient-sound-1.mp3" 
      loop
    />
  );
}
