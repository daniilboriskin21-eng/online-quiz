import { Trophy, Medal, Award } from "lucide-react";

export function LeaderboardTable({
  leaderboard,
  currentMemberId,
  title,
  emptyMessage = "Нет участников",
}) {
  function renderPlaceIcon(place) {
    if (place === 1)
      return <Trophy size={18} style={{ color: "#fbbf24" }} title="1 место" />;
    if (place === 2)
      return <Medal size={18} style={{ color: "#cbd5e1" }} title="2 место" />;
    if (place === 3)
      return <Award size={18} style={{ color: "#f59e0b" }} title="3 место" />;
    return `#${place}`;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <p
        style={{
          color: "var(--text-dim)",
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {title && (
        <h3
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Trophy size={18} style={{ color: "#fbbf24" }} />
          {title}
        </h3>
      )}
      <div className="leaderboard-card">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Место</th>
              <th>Игрок</th>
              <th style={{ width: "100px", textAlign: "right" }}>Баллы</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((p) => {
              const isMe = p.memberId === currentMemberId;

              return (
                <tr
                  key={p.memberId}
                  className={`leaderboard-row ${isMe ? "is-me" : ""}`}
                >
                  <td style={{ verticalAlign: "middle" }}>
                    {renderPlaceIcon(p.place)}
                  </td>
                  <td>
                    {p.nickname}{" "}
                    {isMe && (
                      <span style={{ color: "var(--primary)" }}>(Вы)</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="score-chip">{p.score}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
