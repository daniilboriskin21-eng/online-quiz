import { useState, useEffect } from "react";

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

  return (
    <strong
      style={{
        fontSize: "1.2rem",
        color: secondsLeft <= 5 ? "red" : "inherit",
      }}
    >
      ⏱️ {secondsLeft} сек.
    </strong>
  );
}
