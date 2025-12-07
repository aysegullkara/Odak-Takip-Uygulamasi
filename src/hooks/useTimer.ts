import { useEffect, useState } from "react";

export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  return { seconds, setSeconds, running, setRunning };
}
