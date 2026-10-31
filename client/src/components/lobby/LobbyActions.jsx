import { Play, Loader2 } from "lucide-react";

export function LobbyActions({
  isHost,
  playersCount,
  isStartingGame,
  onStartGame,
  startGameError,
}) {
  if (isHost) {
    return (
      <div style={{ marginTop: "8px" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={onStartGame}
          disabled={isStartingGame || playersCount === 0}
          style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
        >
          <Play size={18} fill="currentColor" />
          {isStartingGame ? "Запускаем викторину…" : "Начать игру"}
        </button>
        {playersCount === 0 && (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: "0.85rem",
              marginTop: "10px",
            }}
          >
            Для старта нужен хотя бы один подключенный игрок
          </p>
        )}
        {startGameError && (
          <div className="form-error" style={{ marginTop: "12px" }}>
            {startGameError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="host-waiting-notice"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <Loader2 size={16} />
      Ожидаем, пока ведущий запустит викторину...
    </div>
  );
}
