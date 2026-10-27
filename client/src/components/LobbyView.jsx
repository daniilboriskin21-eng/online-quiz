export function LobbyView({
  roomState,
  currentUser,
  isStartingGame,
  onStartGame,
  startGameError,
}) {
  const playersCount = roomState?.players?.length ?? 0;

  return (
    <div>
      <p>
        Статус: <strong>Ожидание игроков</strong>
      </p>
      <p>
        Ведущий: {roomState?.hostOnline ? "🟢 в сети" : "⚪ не в сети"}
      </p>

      <h3>Игроки в лобби ({playersCount}):</h3>
      {playersCount === 0 ? (
        <p>Пока никто не присоединился. Отправьте код друзьям!</p>
      ) : (
        <ul>
          {roomState?.players.map((player) => (
            <li key={player.id}>
              <span>{player.nickname}</span>{" "}
              <small>{player.online ? "🟢 в сети" : "⚪ не в сети"}</small>
            </li>
          ))}
        </ul>
      )}

      {currentUser?.role === "host" && (
        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            onClick={onStartGame}
            disabled={isStartingGame || playersCount === 0}
            style={{
              padding: "10px 20px",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            {isStartingGame ? "Запускаем…" : "Начать игру"}
          </button>
          {playersCount === 0 && (
            <p
              style={{
                color: "#888",
                fontSize: "0.9rem",
                marginTop: "8px",
              }}
            >
              Для старта нужен хотя бы один игрок
            </p>
          )}
          {startGameError && (
            <p role="alert" style={{ color: "red" }}>
              {startGameError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
