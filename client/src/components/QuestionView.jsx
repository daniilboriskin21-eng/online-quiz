import { QuestionProgressBar } from "./question/QuestionProgressBar.jsx";
import { QuestionHeader } from "./question/QuestionHeader.jsx";
import { QuestionStatusBanner } from "./question/QuestionStatusBanner.jsx";
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

      <QuestionHeader
        currentNumber={currentNumber}
        totalQuestions={totalQuestions}
        endsAt={round.endsAt}
      />

      <h2 className="question-text">{question.text}</h2>

      <QuestionStatusBanner
        isHost={isHost}
        myAnswer={myAnswer}
        isTextQuestion={isTextQuestion}
      />

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
