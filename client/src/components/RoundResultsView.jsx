import { Clock } from "lucide-react";
import { LeaderboardTable } from "./common/LeaderboardTable.jsx";
import { ChoiceResults } from "./results/ChoiceResults.jsx";
import { TextResults } from "./results/TextResults.jsx";
import { RoundActions } from "./results/RoundActions.jsx";

export function RoundResultsView({
  roomState,
  currentUser,
  isContinuing,
  onContinue,
  continueError,
}) {
  const round = roomState?.round;
  const question = round?.question;
  const results = roomState?.results;
  const myAnswer = roomState?.myAnswer;
  const isHost = currentUser?.role === "host";
  const totalQuestions = roomState?.room?.questionCount || 1;
  const currentNumber = round?.number || 1;
  const isLastQuestion = currentNumber >= totalQuestions;

  return (
    <section className="glass-card results-card">
      <div style={{ textAlign: "center" }}>
        <span
          className="badge badge-host"
          style={{
            marginBottom: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Clock size={13} />
          Время вышло
        </span>
        <h2>
          Итоги раунда {currentNumber} из {totalQuestions}
        </h2>
        <p
          style={{
            marginTop: "6px",
            fontSize: "1.05rem",
            color: "var(--text-primary)",
          }}
        >
          {question.text}
        </p>
      </div>

      {question.type === "choice" ? (
        <ChoiceResults
          options={question.options || []}
          correctOptionId={results?.correctOptionId}
          mySelectedOptionId={myAnswer?.optionId}
        />
      ) : (
        <TextResults
          correctText={results?.correctText}
          myAnswer={myAnswer}
          isHost={isHost}
        />
      )}

      {results?.leaderboard && (
        <LeaderboardTable
          leaderboard={results.leaderboard}
          currentMemberId={currentUser?.memberId}
          title="Текущие баллы игроков"
        />
      )}

      <RoundActions
        isHost={isHost}
        isLastQuestion={isLastQuestion}
        isContinuing={isContinuing}
        onContinue={onContinue}
        continueError={continueError}
      />
    </section>
  );
}
