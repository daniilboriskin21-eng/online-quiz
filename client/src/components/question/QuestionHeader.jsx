import { Timer } from "../common/Timer.jsx";

export function QuestionHeader({ currentNumber, totalQuestions, endsAt }) {
  return (
    <div className="question-header">
      <span className="badge badge-player">
        Вопрос {currentNumber} из {totalQuestions}
      </span>
      <Timer endsAt={endsAt} />
    </div>
  );
}
