import { Trophy, Home, Loader2 } from "lucide-react";
import { LeaderboardTable } from "./common/LeaderboardTable.jsx";
import { Podium } from "./results/Podium.jsx";

export function FinishedView({
  roomState,
  currentUser,
  isLeaving,
  onLeave,
}) {
  const results = roomState?.results;
  const leaderboard = results?.leaderboard || [];
  const quizTitle = roomState?.room?.quizTitle || "Викторина";

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
            background:
              "radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0.05) 100%)",
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
          Квиз:{" "}
          <strong style={{ color: "var(--text-primary)" }}>{quizTitle}</strong>
        </p>
      </div>

      <Podium top1={top1} top2={top2} top3={top3} />

      {rest.length > 0 && (
        <LeaderboardTable
          leaderboard={rest}
          currentMemberId={currentUser?.memberId}
          title="Остальные участники:"
        />
      )}

      <div>
        <button
          type="button"
          className="btn-primary"
          onClick={onLeave}
          disabled={isLeaving}
          style={{
            padding: "12px 28px",
            fontSize: "1.05rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isLeaving ? <Loader2 size={18} /> : <Home size={18} />}
          {isLeaving ? "Выходим…" : "В главное меню"}
        </button>
      </div>
    </section>
  );
}
