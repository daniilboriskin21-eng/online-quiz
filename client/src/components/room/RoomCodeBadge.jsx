import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function RoomCodeBadge({ roomCode }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      className="room-code-badge"
      onClick={handleCopy}
      title="Нажмите, чтобы скопировать код"
    >
      <span>Код: {roomCode}</span>
      {copied ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--success)",
          }}
        >
          <Check size={13} /> Скопирован
        </span>
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}
