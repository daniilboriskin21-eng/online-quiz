import { useState } from "react";
import { Send } from "lucide-react";

export function TextInputAnswer({ isSubmitting, onSubmitText }) {
  const [textInput, setTextInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!textInput.trim() || isSubmitting) return;
    onSubmitText(textInput.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
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
  );
}
