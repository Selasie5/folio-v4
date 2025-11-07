"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";

const BackgroundSoundController = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/ambient-sound-1.mp3" loop />
      <motion.button
        onClick={toggleSound}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition"
      >
        {playing ? <HiSpeakerWave className="h-4 w-4" /> : <HiSpeakerXMark className="h-4 w-4" />}
      </motion.button>
    </>
  );
};

export default BackgroundSoundController;
