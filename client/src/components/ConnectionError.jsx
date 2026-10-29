export function ConnectionError({ error, onRetry }) {
  return (
    <div className="app-container">
      <section className="glass-card error-card">
        <div style={{ fontSize: "2.5rem" }}>📡</div>
        <h2>Ошибка подключения</h2>
        <div className="form-error">{error}</div>
        <button
          type="button"
          className="btn-primary"
          onClick={onRetry}
          style={{ marginTop: "8px" }}
        >
          Попробовать снова 🔄
        </button>
      </section>
    </div>
  );
}

