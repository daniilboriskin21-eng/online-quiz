import { Trophy, ArrowRight, Loader2 } from "lucide-react";

export function RoundActions({
  isHost,
  isLastQuestion,
  isContinuing,
  onContinue,
  continueError,
}) {
  if (isHost) {
    return (
      <div style={{ marginTop: "12px" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={onContinue}
          disabled={isContinuing}
          style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
        >
          {isContinuing ? (
            <>
              <Loader2 size={18} /> Загружаем…
            </>
          ) : !isLastQuestion ? (
            <>
              Следующий вопрос <ArrowRight size={18} />
            </>
          ) : (
            <>
              <Trophy size={18} /> Показать итоги викторины
            </>
          )}
        </button>
        {continueError && (
          <div className="form-error" style={{ marginTop: "12px" }}>
            {continueError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="host-waiting-notice"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <Loader2 size={16} />
      Ожидаем, пока ведущий перейдет к следующему шагу...
    </div>
  );
}
