export function TextResults({ correctText, myAnswer, isHost }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
      }}
    >
      <div
        className="result-option correct"
        style={{
          justifyContent: "center",
          fontSize: "1.1rem",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <span>
          Правильный ответ: <strong>{correctText}</strong>
        </span>
      </div>

      {myAnswer ? (
        <div
          className={`result-option ${myAnswer.isCorrect ? "correct" : "wrong"}`}
          style={{
            justifyContent: "center",
            fontSize: "0.95rem",
            padding: "12px",
          }}
        >
          <span>
            {myAnswer.isCorrect ? "✓ Вы ответили верно: " : "✗ Ваш ответ: "}
            <strong>«{myAnswer.textAnswer}»</strong>
          </span>
        </div>
      ) : (
        !isHost && (
          <p
            style={{
              color: "var(--text-dim)",
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Вы не успели дать ответ на этот вопрос
          </p>
        )
      )}
    </div>
  );
}
