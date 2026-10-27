export function FinishedView({
  roomState,
  currentUser,
  isLeaving,
  onLeave,
}) {
  const results = roomState?.results;

  return (
    <div style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
      <h2>🎉 Игра завершена!</h2>
      <p style={{ color: "#666" }}>
        Квиз: <strong>{roomState?.room.quizTitle}</strong>
      </p>

      {results?.leaderboard && (
        <div style={{ marginTop: "20px" }}>
          <h3>🏆 Итоговый пьедестал</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "10px" }}>Место</th>
                <th style={{ padding: "10px" }}>Игрок</th>
                <th style={{ padding: "10px" }}>Баллы</th>
              </tr>
            </thead>
            <tbody>
              {results.leaderboard.map((p) => {
                const isMe = p.memberId === currentUser?.memberId;
                const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

                return (
                  <tr
                    key={p.memberId}
                    style={{
                      borderBottom: "1px solid #eee",
                      fontWeight: isMe ? "bold" : "normal",
                      backgroundColor: isMe ? "#f5f5f5" : "inherit",
                    }}
                  >
                    <td style={{ padding: "10px", fontSize: "1.1rem" }}>
                      {medals[p.place] || `#${p.place}`}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {p.nickname} {isMe && "(Вы)"}
                    </td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>
                      {p.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <button
          type="button"
          onClick={onLeave}
          disabled={isLeaving}
          style={{
            padding: "12px 24px",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          {isLeaving ? "Выходим..." : "Выйти в главное меню"}
        </button>
      </div>
    </div>
  );
}
