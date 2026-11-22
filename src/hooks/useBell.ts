import { useCallback, useRef } from "react";

type BellType = "waiter" | "kitchen" | "newOrder";

export function useBell() {
  const audioRefs = useRef<Record<BellType, HTMLAudioElement | null>>({
    waiter: null,
    kitchen: null,
    newOrder: null,
  });

  const getAudio = (type: BellType) => {
    const bellFiles: Record<BellType, string> = {
      waiter: "/Bell1.wav",
      kitchen: "/Bell2.wav",
      newOrder: "/Bell3.mp3",
      };

    if (!audioRefs.current[type]) {
      const audio = new Audio(bellFiles[type]);
      audio.preload = "auto";
      audio.volume = 0.8;
      audioRefs.current[type] = audio;
    }

    return audioRefs.current[type]!;
  };

  const playBell = useCallback((type: BellType) => {
    const bell = getAudio(type);

    bell.currentTime = 0;
    void bell.play().catch(() => {
      // El navegador puede bloquear autoplay; aquí lo ignoramos
    });
  }, []);

  return { playBell };
}