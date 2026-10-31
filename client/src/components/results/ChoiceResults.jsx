import { Check, X } from "lucide-react";

export function ChoiceResults({
  options,
  correctOptionId,
  mySelectedOptionId,
}) {
  return (
    <div className="options-grid">
      {options.map((option) => {
        const isCorrect = correctOptionId === option.id;
        const isMyChoice = mySelectedOptionId === option.id;

        let statusClass = "dimmed";
        if (isCorrect) statusClass = "correct";
        else if (isMyChoice && !isCorrect) statusClass = "wrong";

        return (
          <div key={option.id} className={`result-option ${statusClass}`}>
            <span>{option.text}</span>
            {isCorrect && (
              <span
                className="badge badge-online"
                style={{
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Check size={13} /> Верно
              </span>
            )}
            {isMyChoice && !isCorrect && (
              <span
                className="badge"
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  border: "1px solid var(--danger-border)",
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <X size={13} /> Ваш выбор
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
