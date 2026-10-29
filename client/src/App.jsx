import "./App.css";

import { useQuizGame } from "./hooks/useQuizGame.js";
import { ConnectionError } from "./components/ConnectionError.jsx";
import { HomeView } from "./components/HomeView.jsx";
import { RoomHeader } from "./components/RoomHeader.jsx";
import { LobbyView } from "./components/LobbyView.jsx";
import { QuestionView } from "./components/QuestionView.jsx";
import { RoundResultsView } from "./components/RoundResultsView.jsx";
import { FinishedView } from "./components/FinishedView.jsx";

const STATUS_MESSAGES = {
  idle: "Нажмите, чтобы загрузить квизы",
  loading: "Загружаем…",
  success: "Квизы загружены",
  error: "Не удалось загрузить квизы",
};

function App() {
  const game = useQuizGame();

  if (game.isCheckingSession) {
    return (
      <div className="app-container" style={{ justifyContent: "center", minHeight: "60vh" }}>
        <p style={{ color: "var(--text-dim)", fontSize: "1.1rem" }}>Подключение к игре…</p>
      </div>
    );
  }

  if (game.sessionError) {
    return (
      <ConnectionError
        error={game.sessionError}
        onRetry={game.handleRetrySession}
      />
    );
  }

  if (game.currentRoom) {
    const currentStatus =
      game.roomState?.room.status || game.currentRoom.status;

    return (
      <main className="app-container">
        <RoomHeader
          currentRoom={game.currentRoom}
          currentUser={game.currentUser}
          roomState={game.roomState}
          isLeaving={game.isLeaving}
          onLeave={game.handleLeaveGame}
        />

        {currentStatus === "lobby" && (
          <LobbyView
            roomState={game.roomState}
            currentUser={game.currentUser}
            isStartingGame={game.isStartingGame}
            onStartGame={game.handleStartGame}
            startGameError={game.startGameError}
          />
        )}

        {currentStatus === "question" && game.roomState?.round && (
          <QuestionView
            roomState={game.roomState}
            currentUser={game.currentUser}
            isSubmitting={game.isSubmitting}
            onSubmitAnswer={game.handleSubmitAnswer}
            submitError={game.submitError}
          />
        )}

        {currentStatus === "round_results" && game.roomState?.round && (
          <RoundResultsView
            roomState={game.roomState}
            currentUser={game.currentUser}
            isContinuing={game.isContinuing}
            onContinue={game.handleContinueGame}
            continueError={game.continueError}
          />
        )}

        {currentStatus === "finished" && (
          <FinishedView
            roomState={game.roomState}
            currentUser={game.currentUser}
            isLeaving={game.isLeaving}
            onLeave={game.handleLeaveGame}
          />
        )}
      </main>
    );
  }

  return (
    <HomeView
      serverMessage={game.serverMessage}
      onCheckServer={game.checkServer}
      joinCode={game.joinCode}
      setJoinCode={game.setJoinCode}
      joinNickname={game.joinNickname}
      setJoinNickname={game.setJoinNickname}
      joinError={game.joinError}
      isJoining={game.isJoining}
      onJoin={game.handleJoin}
      quizzes={game.quizzes}
      quizzesStatus={game.quizzesStatus}
      onLoadQuizzes={game.loadQuizzes}
      statusMessages={STATUS_MESSAGES}
      onCreateRoom={game.handleCreateRoom}
      isCreatingRoom={game.isCreatingRoom}
      createRoomError={game.createRoomError}
    />
  );
}

export default App;
