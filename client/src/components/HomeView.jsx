import { useEffect } from "react";
import { HeroHeader } from "./home/HeroHeader.jsx";
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
      <HeroHeader />

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
