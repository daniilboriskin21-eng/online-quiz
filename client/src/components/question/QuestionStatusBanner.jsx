import { Crown, CheckCircle2 } from "lucide-react";

export function QuestionStatusBanner({ isHost, myAnswer, isTextQuestion }) {
  if (isHost) {
    return (
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
        Вы ведущий. Игроки {isTextQuestion ? "вводят ответы…" : "делают выбор…"}
      </div>
    );
  }

  if (myAnswer) {
    return (
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
        Ваш ответ {isTextQuestion && `«${myAnswer.textAnswer}»`} принят! Ожидаем
        окончания времени…
      </div>
    );
  }

  return (
    <div className="answer-status-pill info">
      {isTextQuestion
        ? "Введите ваш ответ в поле ниже:"
        : "Выберите правильный вариант ответа:"}
    </div>
  );
}
