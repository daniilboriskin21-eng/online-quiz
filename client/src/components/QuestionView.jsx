import { Timer } from "./Timer.jsx";

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

  return (
    <div style={{ width: "100%", maxWidth: "500px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          Вопрос {round.number} из {roomState.room.questionCount}
        </span>
        <Timer endsAt={round.endsAt} />
      </div>

      <h2 style={{ margin: "20px 0" }}>{question.text}</h2>

      {currentUser?.role === "host" ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Вы ведущий. Игроки выбирают ответы...
        </p>
      ) : myAnswer ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✅ Ваш ответ принят! Ожидаем окончания времени...
        </p>
      ) : (
        <p style={{ color: "#666" }}>Выберите вариант ответа:</p>
      )}

      <div className="options-grid">
        {question.options.map((option) => {
          const isSelected = myAnswer?.optionId === option.id;
          const isDisabled =
            currentUser?.role === "host" ||
            Boolean(myAnswer) ||
            isSubmitting;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSubmitAnswer(option.id)}
              disabled={isDisabled}
              style={{
                padding: "15px",
                fontSize: "1rem",
                cursor: isDisabled ? "default" : "pointer",
                border: isSelected ? "3px solid #2196F3" : "1px solid #ccc",
                backgroundColor: isSelected ? "#e3f2fd" : "inherit",
                fontWeight: isSelected ? "bold" : "normal",
              }}
            >
              {isSelected && "✓ "}
              {option.text}
            </button>
          );
        })}
      </div>

      {submitError && (
        <p role="alert" style={{ color: "red", marginTop: "10px" }}>
          {submitError}
        </p>
      )}
    </div>
  );
}
