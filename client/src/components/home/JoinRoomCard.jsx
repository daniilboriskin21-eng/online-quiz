import { LogIn } from "lucide-react";

export function JoinRoomCard({
  joinCode,
  setJoinCode,
  joinNickname,
  setJoinNickname,
  joinError,
  isJoining,
  onJoin,
}) {
  return (
    <section className="glass-card">
      <div style={{ marginBottom: "18px" }}>
        <h2>Войти в игру</h2>
        <p>Введите код, полученный от ведущего</p>
      </div>

      <form onSubmit={onJoin} className="join-form">
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "6px",
            }}
          >
            Код комнаты
          </label>
          <input
            className="input-field room-code-input"
            type="text"
            placeholder="ABCDEF"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "6px",
            }}
          >
            Ваш никнейм
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="Например, Alex"
            value={joinNickname}
            onChange={(e) => setJoinNickname(e.target.value)}
            maxLength={20}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isJoining}
          style={{ width: "100%", marginTop: "8px", padding: "12px" }}
        >
          <LogIn size={16} />
          {isJoining ? "Входим…" : "Войти в игру"}
        </button>

        {joinError && <div className="form-error">{joinError}</div>}
      </form>
    </section>
  );
}
