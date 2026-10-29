import { useEffect } from "react";

export function HomeView({
  joinCode,
  setJoinCode,
  joinNickname,
  setJoinNickname,
  joinError,
  isJoining,
  onJoin,
  quizzes,
  quizzesStatus,
  onLoadQuizzes,
  onCreateRoom,
  isCreatingRoom,
  createRoomError,
}) {
  // Автоматически подгружаем квизы, если они еще не загружены
  useEffect(() => {
    if (quizzesStatus === "idle") {
      onLoadQuizzes();
    }
  }, [quizzesStatus, onLoadQuizzes]);

  return (
    <div className="app-container">
      <header className="hero-header">
        <h1>Онлайн-квиз</h1>
        <p className="hero-subtitle">
          Битва эрудитов в реальном времени с друзьями и коллегами
        </p>
      </header>

      <div className="home-grid">
        {/* Карточка 1: Войти по коду */}
        <section className="glass-card">
          <div style={{ marginBottom: "18px" }}>
            <h2>Войти в игру</h2>
            <p>Введите код, полученный от ведущего</p>
          </div>

          <form onSubmit={onJoin} className="join-form">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Код комнаты
              </label>
              <input
                className="input-field room-code-input"
                type="text"
                placeholder="ABCDEF"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Ваш никнейм
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Например, Alex"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isJoining}
              style={{ width: "100%", marginTop: "8px", padding: "12px" }}
            >
              {isJoining ? "Входим…" : "Войти в игру →"}
            </button>

            {joinError && <div className="form-error">{joinError}</div>}
          </form>
        </section>

        {/* Карточка 2: Создать комнату */}
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
                        <h4>🎯 {quiz.title}</h4>
                        <span>Вопросов: {quiz.questionCount}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onCreateRoom(quiz.id)}
                        disabled={isCreatingRoom}
                        style={{ fontSize: "0.85rem", padding: "8px 14px" }}
                      >
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
      </div>
    </div>
  );
}