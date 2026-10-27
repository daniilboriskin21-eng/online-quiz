export function ConnectionError({ error, onRetry }) {
  return (
    <section id="center">
      <h2>🔴 Ошибка подключения</h2>
      <p style={{ color: "red" }}>{error}</p>
      <button
        type="button"
        onClick={onRetry}
        style={{ padding: "10px 20px", marginTop: "15px", cursor: "pointer" }}
      >
        Попробовать снова
      </button>
    </section>
  );
}
