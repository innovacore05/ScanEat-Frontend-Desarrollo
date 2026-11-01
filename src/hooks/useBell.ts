import { useCallback, useRef } from "react";

type BellType = "waiter" | "kitchen";

export function useBell() {
  const audioRefs = useRef<Record<BellType, HTMLAudioElement | null>>({
    waiter: null,
    kitchen: null,
  });

  const getAudio = (type: BellType) => {
    if (!audioRefs.current[type]) {
      const audio = new Audio(type === "waiter" ? "/Bell1.wav" : "/Bell2.wav");
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