import { Crown, CheckCircle2, Check } from "lucide-react";
import { Timer } from "./Timer.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuestionView({
  roomState,
  currentUser,
  isSubmitting,
  onSubmitAnswer,
  submitError,
}) {
  const round = roomState?.round;
  const question = round?.question;
  const myAnswer = roomState?.myAnswer;
  const totalQuestions = roomState?.room?.questionCount || 1;
  const currentNumber = round?.number || 1;
  const isHost = currentUser?.role === "host";

  const progressPercent = Math.min(100, Math.round((currentNumber / totalQuestions) * 100));

  return (
    <section className="glass-card question-card">
      {/* Прогресс-бар вверху карточки */}
      <div
        className="question-progress-bar"
        style={{ width: `${progressPercent}%` }}
      />

      <div className="question-header">
        <span className="badge badge-player">
          Вопрос {currentNumber} из {totalQuestions}
        </span>
        <Timer endsAt={round.endsAt} />
      </div>

      <h2 className="question-text">{question.text}</h2>

      {/* Информационный баннер статуса */}
      {isHost ? (
        <div className="answer-status-pill info" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <Crown size={16} />
          Вы ведущий. Игроки делают выбор…
        </div>
      ) : myAnswer ? (
        <div className="answer-status-pill success" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <CheckCircle2 size={16} />
          Ваш ответ принят! Ожидаем окончания времени…
        </div>
      ) : (
        <div className="answer-status-pill info">
          Выберите правильный вариант ответа:
        </div>
      )}

      {/* Сетка вариантов ответа */}
      <div className="options-grid">
        {question.options.map((option, index) => {
          const isSelected = myAnswer?.optionId === option.id;
          const isDisabled = isHost || Boolean(myAnswer) || isSubmitting;
          const letter = OPTION_LETTERS[index] || "•";

          return (
            <button
              key={option.id}
              type="button"
              className={`option-btn ${isSelected ? "selected" : ""}`}
              onClick={() => onSubmitAnswer(option.id)}
              disabled={isDisabled}
              style={{
                opacity: isDisabled && !isSelected ? 0.65 : 1,
                cursor: isDisabled ? "default" : "pointer",
              }}
            >
              <span className="option-letter">{letter}</span>
              <span style={{ flexGrow: 1 }}>{option.text}</span>
              {isSelected && <Check size={16} style={{ color: "var(--primary)" }} />}
            </button>
          );
        })}
      </div>

      {submitError && <div className="form-error">{submitError}</div>}
    </section>
  );
}