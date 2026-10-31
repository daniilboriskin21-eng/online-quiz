export function QuestionProgressBar({ currentNumber, totalQuestions }) {
  const percent = Math.min(
    100,
    Math.round((currentNumber / Math.max(1, totalQuestions)) * 100),
  );

  return (
    <div
      className="question-progress-bar"
      style={{ width: `${percent}%` }}
    />
  );
}
