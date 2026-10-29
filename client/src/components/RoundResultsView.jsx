import { Clock, Trophy, Medal, Award, Check, X, ArrowRight, Loader2 } from "lucide-react";

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
  const isHost = currentUser?.role === "host";
  const totalQuestions = roomState?.room?.questionCount || 1;
  const currentNumber = round?.number || 1;
  const isLastQuestion = currentNumber >= totalQuestions;

  function renderPlaceIcon(place) {
    if (place === 1) return <Trophy size={18} style={{ color: "#fbbf24" }} title="1 место" />;
    if (place === 2) return <Medal size={18} style={{ color: "#cbd5e1" }} title="2 место" />;
    if (place === 3) return <Award size={18} style={{ color: "#f59e0b" }} title="3 место" />;
    return `#${place}`;
  }

  return (
    <section className="glass-card results-card">
      <div style={{ textAlign: "center" }}>
        <span
          className="badge badge-host"
          style={{ marginBottom: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Clock size={13} />
          Время вышло
        </span>
        <h2>Итоги раунда {currentNumber} из {totalQuestions}</h2>
        <p style={{ marginTop: "6px", fontSize: "1.05rem", color: "var(--text-primary)" }}>
          {question.text}
        </p>
      </div>

      {/* Варианты ответов с подсветкой */}
      <div className="options-grid">
        {question.options.map((option) => {
          const isCorrect = results?.correctOptionId === option.id;
          const isMyChoice = myAnswer?.optionId === option.id;

          let statusClass = "dimmed";
          if (isCorrect) statusClass = "correct";
          else if (isMyChoice && !isCorrect) statusClass = "wrong";

          return (
            <div key={option.id} className={`result-option ${statusClass}`}>
              <span>{option.text}</span>
              {isCorrect && (
                <span
                  className="badge badge-online"
                  style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Check size={13} /> Верно
                </span>
              )}
              {isMyChoice && !isCorrect && (
                <span
                  className="badge"
                  style={{
                    background: "var(--danger-bg)",
                    color: "var(--danger)",
                    border: "1px solid var(--danger-border)",
                    fontSize: "0.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <X size={13} /> Ваш выбор
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Таблица лидеров */}
      {results?.leaderboard && (
        <div style={{ marginTop: "8px" }}>
          <h3 style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={18} style={{ color: "#fbbf24" }} />
            Текущие баллы игроков
          </h3>
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
                {results.leaderboard.map((p) => {
                  const isMe = p.memberId === currentUser?.memberId;

                  return (
                    <tr
                      key={p.memberId}
                      className={`leaderboard-row ${isMe ? "is-me" : ""}`}
                    >
                      <td style={{ verticalAlign: "middle" }}>{renderPlaceIcon(p.place)}</td>
                      <td>
                        {p.nickname} {isMe && <span style={{ color: "var(--primary)" }}>(Вы)</span>}
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
      )}

      {/* Действия ведущего или ожидание игроков */}
      {isHost ? (
        <div style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onContinue}
            disabled={isContinuing}
            style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
          >
            {isContinuing ? (
              <>
                <Loader2 size={18} /> Загружаем…
              </>
            ) : !isLastQuestion ? (
              <>
                Следующий вопрос <ArrowRight size={18} />
              </>
            ) : (
              <>
                <Trophy size={18} /> Показать итоги викторины
              </>
            )}
          </button>
          {continueError && (
            <div className="form-error" style={{ marginTop: "12px" }}>
              {continueError}
            </div>
          )}
        </div>
      ) : (
        <div
          className="host-waiting-notice"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Loader2 size={16} />
          Ожидаем, пока ведущий перейдет к следующему шагу...
        </div>
      )}
    </section>
  );
}