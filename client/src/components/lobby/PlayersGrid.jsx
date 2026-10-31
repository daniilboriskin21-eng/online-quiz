import { Users } from "lucide-react";

export function PlayersGrid({ players }) {
  const playersCount = players?.length ?? 0;

  return (
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
  );
}
