import { LobbyStatusBanner } from "./lobby/LobbyStatusBanner.jsx";
import { PlayersGrid } from "./lobby/PlayersGrid.jsx";
import { LobbyActions } from "./lobby/LobbyActions.jsx";

export function LobbyView({
  roomState,
  currentUser,
  isStartingGame,
  onStartGame,
  startGameError,
}) {
  const players = roomState?.players || [];
  const playersCount = players.length;
  const isHost = currentUser?.role === "host";
  const hostOnline = roomState?.hostOnline;

  return (
    <section className="glass-card lobby-card">
      <div>
        <h2>Комната ожидания</h2>
        <p>Игроки собираются. Ведущий начнет викторину, когда все будут готовы.</p>
      </div>

      <LobbyStatusBanner
        hostOnline={hostOnline}
        playersCount={playersCount}
      />

      <PlayersGrid players={players} />

      <LobbyActions
        isHost={isHost}
        playersCount={playersCount}
        isStartingGame={isStartingGame}
        onStartGame={onStartGame}
        startGameError={startGameError}
      />
    </section>
  );
}
