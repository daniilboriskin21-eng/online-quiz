import { Crown, CheckCircle2 } from "lucide-react";
import { Timer } from "./common/Timer.jsx";
import { QuestionProgressBar } from "./question/QuestionProgressBar.jsx";
import { ChoiceOptions } from "./question/ChoiceOptions.jsx";
import { TextInputAnswer } from "./question/TextInputAnswer.jsx";

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
  const isTextQuestion = question?.type === "text";

  return (
    <section className="glass-card question-card">
      <QuestionProgressBar
        currentNumber={currentNumber}
        totalQuestions={totalQuestions}
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

      {/* Варианты ответа в зависимости от типа */}
      {isTextQuestion ? (
        !isHost &&
        !myAnswer && (
          <TextInputAnswer
            isSubmitting={isSubmitting}
            onSubmitText={(textAnswer) => onSubmitAnswer({ textAnswer })}
          />
        )
      ) : (
        <ChoiceOptions
          options={question.options || []}
          selectedOptionId={myAnswer?.optionId}
          isDisabled={isHost || Boolean(myAnswer) || isSubmitting}
          onSelectOption={(optionId) => onSubmitAnswer(optionId)}
        />
      )}

      {submitError && <div className="form-error">{submitError}</div>}
    </section>
  );
}
