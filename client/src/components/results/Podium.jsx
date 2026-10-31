import { Crown, Medal, Award } from "lucide-react";

export function Podium({ top1, top2, top3 }) {
  return (
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
  );
}
