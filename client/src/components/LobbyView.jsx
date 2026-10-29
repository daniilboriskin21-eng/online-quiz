import { Users, Play, Loader2 } from "lucide-react";

export function LobbyView({
  roomState,
  currentUser,
  isStartingGame,
  onStartGame,
  startGameError,
}) {
  const players = roomState?.players || [];
  const playersCount = players.length;
  const isHost = currentUser?.role === "host";
  const hostOnline = roomState?.hostOnline;

  return (
    <section className="glass-card lobby-card">
      <div>
        <h2>Комната ожидания</h2>
        <p>Игроки собираются. Ведущий начнет викторину, когда все будут готовы.</p>
      </div>

      <div className="lobby-status-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>Ведущий:</span>
          {hostOnline ? (
            <span className="badge badge-online">
              <span className="status-dot online" style={{ width: 6, height: 6 }} /> в сети
            </span>
          ) : (
            <span className="badge badge-offline">
              <span className="status-dot offline" style={{ width: 6, height: 6 }} /> не в сети
            </span>
          )}
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Игроков: <strong style={{ color: "var(--text-primary)" }}>{playersCount}</strong>
        </div>
      </div>

      <div className="players-container">
        <div className="players-header">
          <h3>Участники в комнате</h3>
          {playersCount > 0 && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
              {playersCount} чел.
            </span>
          )}
        </div>

        {playersCount === 0 ? (
          <div className="lobby-empty">
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Users size={28} style={{ color: "var(--primary)" }} />
            </div>
            <h4 style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
              Пока никого нет
            </h4>
            <p>Отправьте код комнаты друзьям, чтобы они могли присоединиться!</p>
          </div>
        ) : (
          <div className="players-grid">
            {players.map((player) => {
              const initial = player.nickname
                ? player.nickname[0].toUpperCase()
                : "?";
              return (
                <div key={player.id} className="player-card">
                  <div className="player-avatar">{initial}</div>
                  <span className="player-name" title={player.nickname}>
                    {player.nickname}
                  </span>
                  <span
                    className={`status-dot ${player.online ? "online" : "offline"}`}
                    title={player.online ? "В сети" : "Не в сети"}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isHost ? (
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
      ) : (
        <div
          className="host-waiting-notice"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Loader2 size={16} />
          Ожидаем, пока ведущий запустит викторину...
        </div>
      )}
    </section>
  );
}