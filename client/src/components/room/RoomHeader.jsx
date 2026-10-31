import { HelpCircle, LogOut } from "lucide-react";
import { RoomCodeBadge } from "./RoomCodeBadge.jsx";
import { UserRoleBadge } from "./UserRoleBadge.jsx";

export function RoomHeader({
  currentRoom,
  currentUser,
  roomState,
  isLeaving,
  onLeave,
}) {
  const roomCode = currentRoom?.code || "";
  const quizTitle = roomState?.room?.quizTitle || "Викторина";
  const isHost = currentUser?.role === "host";

  return (
    <header className="glass-card room-header">
      <div className="room-header-info">
        <span
          className="room-quiz-title"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <HelpCircle size={18} style={{ color: "var(--primary)" }} />
          {quizTitle}
        </span>
        <RoomCodeBadge roomCode={roomCode} />
      </div>

      <div className="room-header-actions">
        <UserRoleBadge isHost={isHost} nickname={currentUser?.nickname} />

        <button
          type="button"
          className="btn-danger"
          onClick={onLeave}
          disabled={isLeaving}
          style={{
            padding: "6px 12px",
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <LogOut size={13} />
          {isLeaving ? "Выходим…" : "Выйти"}
        </button>
      </div>
    </header>
  );
}
