import { useState } from "react";
import { HelpCircle, Copy, Check, Crown, User, LogOut } from "lucide-react";

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
        <span className="room-quiz-title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <HelpCircle size={18} style={{ color: "var(--primary)" }} />
          {quizTitle}
        </span>
        <button
          type="button"
          className="room-code-badge"
          onClick={handleCopyCode}
          title="Нажмите, чтобы скопировать код"
        >
          <span>Код: {roomCode}</span>
          {copied ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--success)" }}>
              <Check size={13} /> Скопирован
            </span>
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>

      <div className="room-header-actions">
        {isHost ? (
          <span className="badge badge-host" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <Crown size={13} /> Ведущий
          </span>
        ) : (
          <span className="badge badge-player" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <User size={13} /> {currentUser?.nickname || "Игрок"}
          </span>
        )}

        <button
          type="button"
          className="btn-danger"
          onClick={onLeave}
          disabled={isLeaving}
          style={{ padding: "6px 12px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <LogOut size={13} />
          {isLeaving ? "Выходим…" : "Выйти"}
        </button>
      </div>
    </header>
  );
}