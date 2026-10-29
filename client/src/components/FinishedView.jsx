import { Trophy, Crown, Medal, Award, Home, Loader2 } from "lucide-react";

export function FinishedView({
  roomState,
  currentUser,
  isLeaving,
  onLeave,
}) {
  const results = roomState?.results;
  const leaderboard = results?.leaderboard || [];
  const quizTitle = roomState?.room?.quizTitle || "Викторина";

  // Разделяем топ-3 для пьедестала и остальных участников
  const top1 = leaderboard.find((p) => p.place === 1);
  const top2 = leaderboard.find((p) => p.place === 2);
  const top3 = leaderboard.find((p) => p.place === 3);
  const rest = leaderboard.filter((p) => p.place > 3);

  return (
    <section className="glass-card finished-card">
      <div>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0.05) 100%)",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            boxShadow: "0 0 24px rgba(234, 179, 8, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          <Trophy size={32} style={{ color: "#fbbf24" }} />
        </div>
        <h1>Викторина завершена!</h1>
        <p style={{ marginTop: "4px" }}>
          Квиз: <strong style={{ color: "var(--text-primary)" }}>{quizTitle}</strong>
        </p>
      </div>

      {/* Визуальный пьедестал (Подиум) */}
      <div className="podium-container">
        {/* 2-е место (слева) */}
        {top2 && (
          <div className="podium-place podium-2">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(148, 163, 184, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              <Medal size={24} style={{ color: "#cbd5e1" }} />
            </div>
            <span className="podium-name" title={top2.nickname}>
              {top2.nickname}
            </span>
            <span className="podium-score">{top2.score} очков</span>
            <div className="podium-block">2</div>
          </div>
        )}

        {/* 1-е место (в центре) */}
        {top1 && (
          <div className="podium-place podium-1">
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(234, 179, 8, 0.15)",
                border: "1px solid rgba(234, 179, 8, 0.5)",
                boxShadow: "0 0 16px rgba(234, 179, 8, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              <Crown size={28} style={{ color: "#fbbf24" }} />
            </div>
            <span className="podium-name" title={top1.nickname}>
              {top1.nickname}
            </span>
            <span className="podium-score">{top1.score} очков</span>
            <div className="podium-block">1</div>
          </div>
        )}

        {/* 3-е место (справа) */}
        {top3 && (
          <div className="podium-place podium-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(217, 119, 6, 0.15)",
                border: "1px solid rgba(217, 119, 6, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "8px",
              }}
            >
              <Award size={22} style={{ color: "#f59e0b" }} />
            </div>
            <span className="podium-name" title={top3.nickname}>
              {top3.nickname}
            </span>
            <span className="podium-score">{top3.score} очков</span>
            <div className="podium-block">3</div>
          </div>
        )}
      </div>

      {/* Таблица остальных игроков (места 4+) */}
      {rest.length > 0 && (
        <div style={{ textAlign: "left" }}>
          <h4 style={{ marginBottom: "10px", color: "var(--text-secondary)" }}>
            Остальные участники:
          </h4>
          <div className="leaderboard-card">
            <table className="leaderboard-table">
              <tbody>
                {rest.map((p) => {
                  const isMe = p.memberId === currentUser?.memberId;
                  return (
                    <tr
                      key={p.memberId}
                      className={`leaderboard-row ${isMe ? "is-me" : ""}`}
                    >
                      <td style={{ width: "80px" }}>#{p.place}</td>
                      <td>
                        {p.nickname} {isMe && "(Вы)"}
                      </td>
                      <td style={{ width: "100px", textAlign: "right" }}>
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

      <div>
        <button
          type="button"
          className="btn-primary"
          onClick={onLeave}
          disabled={isLeaving}
          style={{ padding: "12px 28px", fontSize: "1.05rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          {isLeaving ? <Loader2 size={18} /> : <Home size={18} />}
          {isLeaving ? "Выходим…" : "В главное меню"}
        </button>
      </div>
    </section>
  );
}