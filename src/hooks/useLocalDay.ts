import { useEffect, useState } from "react";

const getLocalDayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useLocalDay() {
  const [dayKey, setDayKey] = useState(getLocalDayKey);

  useEffect(() => {
    const syncDay = () => setDayKey(getLocalDayKey());

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );

      return window.setTimeout(() => {
        syncDay();
        scheduleNextMidnight();
      }, nextMidnight.getTime() - now.getTime());
    };

    syncDay();
    let midnightTimeout = scheduleNextMidnight();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncDay();
        window.clearTimeout(midnightTimeout);
        midnightTimeout = scheduleNextMidnight();
      }
    };

    window.addEventListener("focus", syncDay);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(midnightTimeout);
      window.removeEventListener("focus", syncDay);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return dayKey;
}
