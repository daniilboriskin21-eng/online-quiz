export function RoundResultsView({
  roomState,
  currentUser,
  isContinuing,
  onContinue,
  continueError,
}) {
  const round = roomState?.round;
  const question = round?.question;
  const results = roomState?.results;
  const myAnswer = roomState?.myAnswer;

  return (
    <div style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
      <h2>⏰ Время вышло!</h2>
      <h3 style={{ margin: "15px 0" }}>{question.text}</h3>

      <div className="options-grid" style={{ marginBottom: "25px" }}>
        {question.options.map((option) => {
          const isCorrect = results?.correctOptionId === option.id;
          const isMyChoice = myAnswer?.optionId === option.id;

          let border = "1px solid #ccc";
          let bg = "inherit";

          if (isCorrect) {
            border = "3px solid #4CAF50";
            bg = "#e8f5e9";
          } else if (isMyChoice && !isCorrect) {
            border = "3px solid #f44336";
            bg = "#ffebee";
          }

          return (
            <div
              key={option.id}
              style={{
                padding: "15px",
                fontSize: "1rem",
                border,
                backgroundColor: bg,
                borderRadius: "6px",
                fontWeight: isCorrect || isMyChoice ? "bold" : "normal",
              }}
            >
              {isCorrect && "🟢 "}
              {isMyChoice && !isCorrect && "🔴 "}
              {option.text}
              {isCorrect && " (Верно!)"}
            </div>
          );
        })}
      </div>

      {results?.leaderboard && (
        <div>
          <h3>🏆 Таблица лидеров</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc" }}>
                <th style={{ padding: "8px" }}>Место</th>
                <th style={{ padding: "8px" }}>Игрок</th>
                <th style={{ padding: "8px" }}>Очки</th>
              </tr>
            </thead>
            <tbody>
              {results.leaderboard.map((p) => {
                const isMe = p.memberId === currentUser?.memberId;
                return (
                  <tr
                    key={p.memberId}
                    style={{
                      borderBottom: "1px solid #eee",
                      fontWeight: isMe ? "bold" : "normal",
                      backgroundColor: isMe ? "#f5f5f5" : "inherit",
                    }}
                  >
                    <td style={{ padding: "8px" }}>#{p.place}</td>
                    <td style={{ padding: "8px" }}>
                      {p.nickname} {isMe && "(Вы)"}
                    </td>
                    <td style={{ padding: "8px" }}>{p.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {currentUser?.role === "host" ? (
        <div style={{ marginTop: "25px" }}>
          <button
            type="button"
            onClick={onContinue}
            disabled={isContinuing}
            style={{
              padding: "12px 24px",
              fontSize: "1.1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isContinuing
              ? "Загружаем…"
              : round.number < roomState.room.questionCount
                ? "Следующий вопрос →"
                : "Показать итоги игры 🏆"}
          </button>
          {continueError && (
            <p role="alert" style={{ color: "red", marginTop: "10px" }}>
              {continueError}
            </p>
          )}
        </div>
      ) : (
        <p
          style={{
            marginTop: "20px",
            color: "#666",
            fontStyle: "italic",
          }}
        >
          Ожидаем, пока ведущий продолжит игру...
        </p>
      )}
    </div>
  );
}
