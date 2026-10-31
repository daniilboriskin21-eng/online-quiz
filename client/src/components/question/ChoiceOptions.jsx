import { Check } from "lucide-react";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function ChoiceOptions({
  options,
  selectedOptionId,
  isDisabled,
  onSelectOption,
}) {
  return (
    <div className="options-grid">
      {options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;
        const letter = OPTION_LETTERS[index] || "•";

        return (
          <button
            key={option.id}
            type="button"
            className={`option-btn ${isSelected ? "selected" : ""}`}
            onClick={() => onSelectOption(option.id)}
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
  );
}
