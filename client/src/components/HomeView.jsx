import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { JoinRoomCard } from "./home/JoinRoomCard.jsx";
import { QuizListCard } from "./home/QuizListCard.jsx";

export function HomeView({
  joinCode,
  setJoinCode,
  joinNickname,
  setJoinNickname,
  joinError,
  isJoining,
  onJoin,
  quizzes,
  quizzesStatus,
  onLoadQuizzes,
  onCreateRoom,
  isCreatingRoom,
  createRoomError,
}) {
  useEffect(() => {
    if (quizzesStatus === "idle") {
      onLoadQuizzes();
    }
  }, [quizzesStatus, onLoadQuizzes]);

  return (
    <div className="app-container">
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

      <div className="home-grid">
        <JoinRoomCard
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          joinNickname={joinNickname}
          setJoinNickname={setJoinNickname}
          joinError={joinError}
          isJoining={isJoining}
          onJoin={onJoin}
        />

        <QuizListCard
          quizzes={quizzes}
          quizzesStatus={quizzesStatus}
          onLoadQuizzes={onLoadQuizzes}
          onCreateRoom={onCreateRoom}
          isCreatingRoom={isCreatingRoom}
          createRoomError={createRoomError}
        />
      </div>
    </div>
  );
}
