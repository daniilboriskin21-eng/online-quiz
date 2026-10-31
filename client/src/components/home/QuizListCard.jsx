import { HelpCircle, Plus, RefreshCw } from "lucide-react";

export function QuizListCard({
  quizzes,
  quizzesStatus,
  onLoadQuizzes,
  onCreateRoom,
  isCreatingRoom,
  createRoomError,
}) {
  return (
    <section className="glass-card">
      <div>
        <h2>Создать игру</h2>
        <p>Выберите викторину и станьте ведущим</p>
      </div>

      {quizzesStatus === "loading" && (
        <p style={{ marginTop: "24px", color: "var(--text-dim)" }}>
          Загружаем доступные викторины…
        </p>
      )}

      {quizzesStatus === "error" && (
        <div style={{ marginTop: "16px" }}>
          <div className="form-error" style={{ marginBottom: "12px" }}>
            Не удалось загрузить список квизов
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onLoadQuizzes}
          >
            <RefreshCw size={14} />
            Повторить попытку
          </button>
        </div>
      )}

      {quizzesStatus === "success" && (
        <>
          {quizzes.length === 0 ? (
            <p style={{ marginTop: "20px" }}>Нет доступных викторин</p>
          ) : (
            <div className="quiz-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-item">
                  <div className="quiz-info">
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <HelpCircle
                        size={16}
                        style={{ color: "var(--primary)" }}
                      />
                      {quiz.title}
                    </h4>
                    <span>Вопросов: {quiz.questionCount}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onCreateRoom(quiz.id)}
                    disabled={isCreatingRoom}
                    style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                  >
                    <Plus size={14} />
                    {isCreatingRoom ? "Создаем…" : "Создать"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {createRoomError && (
        <div className="form-error" style={{ marginTop: "16px" }}>
          {createRoomError}
        </div>
      )}
    </section>
  );
}
