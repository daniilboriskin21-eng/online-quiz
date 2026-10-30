import { useState } from "react";
import { Crown, CheckCircle2, Check, Send } from "lucide-react";
import { Timer } from "./Timer.jsx";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuestionView({
  roomState,
  currentUser,
  isSubmitting,
  onSubmitAnswer,
  submitError,
}) {
  const [textInput, setTextInput] = useState("");

  const round = roomState?.round;
  const question = round?.question;
  const myAnswer = roomState?.myAnswer;
  const totalQuestions = roomState?.room?.questionCount || 1;
  const currentNumber = round?.number || 1;
  const isHost = currentUser?.role === "host";
  const isTextQuestion = question?.type === "text";

  const progressPercent = Math.min(
    100,
    Math.round((currentNumber / totalQuestions) * 100),
  );

  function handleTextSubmit(e) {
    e.preventDefault();
    if (!textInput.trim() || isSubmitting) return;
    onSubmitAnswer({ textAnswer: textInput.trim() });
  }

  return (
    <section className="glass-card question-card">
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
        <div
          className="answer-status-pill info"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Crown size={16} />
          Вы ведущий. Игроки{" "}
          {isTextQuestion ? "вводят ответы…" : "делают выбор…"}
        </div>
      ) : myAnswer ? (
        <div
          className="answer-status-pill success"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          Ваш ответ {isTextQuestion && `«${myAnswer.textAnswer}»`} принят!
          Ожидаем окончания времени…
        </div>
      ) : (
        <div className="answer-status-pill info">
          {isTextQuestion
            ? "Введите ваш ответ в поле ниже:"
            : "Выберите правильный вариант ответа:"}
        </div>
      )}

      {/* Если вопрос с открытым текстовым вводом */}
      {isTextQuestion ? (
        !isHost &&
        !myAnswer && (
          <form
            onSubmit={handleTextSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <input
              className="input-field"
              type="text"
              placeholder="Введите фамилию или ответ…"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              style={{
                fontSize: "1.1rem",
                padding: "14px 18px",
                textAlign: "center",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !textInput.trim()}
              style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
            >
              <Send size={16} />
              {isSubmitting ? "Отправляем…" : "Отправить ответ"}
            </button>
          </form>
        )
      ) : (
        /* Если вопрос с вариантами ответов */
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
                {isSelected && (
                  <Check size={16} style={{ color: "var(--primary)" }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {submitError && <div className="form-error">{submitError}</div>}
    </section>
  );
}
