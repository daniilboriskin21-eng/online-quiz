import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function Timer({ endsAt }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000),
      );

      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [endsAt]);

  const isDanger = secondsLeft <= 5;

  return (
    <div className={`timer-badge ${isDanger ? "danger" : ""}`}>
      <Clock size={16} />
      <span>{secondsLeft} с</span>
    </div>
  );
}
