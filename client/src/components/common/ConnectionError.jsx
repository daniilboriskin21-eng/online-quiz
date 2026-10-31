import { WifiOff, RefreshCw } from "lucide-react";

export function ConnectionError({ error, onRetry }) {
  return (
    <div className="app-container">
      <section className="glass-card error-card">
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
          }}
        >
          <WifiOff size={32} style={{ color: "var(--danger)" }} />
        </div>
        <h2>Ошибка подключения</h2>
        <div className="form-error">{error}</div>
        <button
          type="button"
          className="btn-primary"
          onClick={onRetry}
          style={{
            marginTop: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <RefreshCw size={16} />
          Попробовать снова
        </button>
      </section>
    </div>
  );
}
