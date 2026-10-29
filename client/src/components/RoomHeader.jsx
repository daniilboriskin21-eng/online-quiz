import { useState } from "react";

export function RoomHeader({
  currentRoom,
  currentUser,
  roomState,
  isLeaving,
  onLeave,
}) {
  const [copied, setCopied] = useState(false);

  const roomCode = currentRoom?.code || "";
  const quizTitle = roomState?.room?.quizTitle || "Викторина";
  const isHost = currentUser?.role === "host";

  function handleCopyCode() {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="glass-card room-header">
      <div className="room-header-info">
        <span className="room-quiz-title">🎯 {quizTitle}</span>
        <button
          type="button"
          className="room-code-badge"
          onClick={handleCopyCode}
          title="Нажмите, чтобы скопировать код"
        >
          <span>Код: {roomCode}</span>
          <span style={{ fontSize: "0.8rem" }}>
            {copied ? "✓ Скопирован!" : "📋"}
          </span>
        </button>
      </div>

      <div className="room-header-actions">
        {isHost ? (
          <span className="badge badge-host">👑 Ведущий</span>
        ) : (
          <span className="badge badge-player">
            👤 {currentUser?.nickname || "Игрок"}
          </span>
        )}

        <button
          type="button"
          className="btn-danger"
          onClick={onLeave}
          disabled={isLeaving}
          style={{ padding: "6px 12px", fontSize: "0.85rem" }}
        >
          {isLeaving ? "Выходим…" : "Выйти"}
        </button>
      </div>
    </header>
  );
}