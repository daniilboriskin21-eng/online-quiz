import { Clock, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { LeaderboardTable } from "./common/LeaderboardTable.jsx";
import { ChoiceResults } from "./results/ChoiceResults.jsx";
import { TextResults } from "./results/TextResults.jsx";

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

      {isHost ? (
        <div style={{ marginTop: "12px" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onContinue}
            disabled={isContinuing}
            style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
          >
            {isContinuing ? (
              <>
                <Loader2 size={18} /> Загружаем…
              </>
            ) : !isLastQuestion ? (
              <>
                Следующий вопрос <ArrowRight size={18} />
              </>
            ) : (
              <>
                <Trophy size={18} /> Показать итоги викторины
              </>
            )}
          </button>
          {continueError && (
            <div className="form-error" style={{ marginTop: "12px" }}>
              {continueError}
            </div>
          )}
        </div>
      ) : (
        <div
          className="host-waiting-notice"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Loader2 size={16} />
          Ожидаем, пока ведущий перейдет к следующему шагу...
        </div>
      )}
    </section>
  );
}
