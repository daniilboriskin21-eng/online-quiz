import { Sparkles } from "lucide-react";

export function HeroHeader() {
  return (
    <header className="hero-header">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <Sparkles size={28} style={{ color: "var(--primary)" }} />
        <h1>Онлайн-квиз</h1>
      </div>
      <p className="hero-subtitle">
        Битва эрудитов в реальном времени с друзьями и коллегами
      </p>
    </header>
  );
}
