export function LobbyStatusBanner({ hostOnline, playersCount }) {
  return (
    <div className="lobby-status-banner">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Ведущий:</span>
        {hostOnline ? (
          <span className="badge badge-online">
            <span
              className="status-dot online"
              style={{ width: 6, height: 6 }}
            />{" "}
            в сети
          </span>
        ) : (
          <span className="badge badge-offline">
            <span
              className="status-dot offline"
              style={{ width: 6, height: 6 }}
            />{" "}
            не в сети
          </span>
        )}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
        Игроков:{" "}
        <strong style={{ color: "var(--text-primary)" }}>{playersCount}</strong>
      </div>
    </div>
  );
}
