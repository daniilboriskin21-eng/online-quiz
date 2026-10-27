export function HomeView({
  serverMessage,
  onCheckServer,
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
  statusMessages,
  onCreateRoom,
  isCreatingRoom,
  createRoomError,
}) {
  return (
    <section id="center">
      <div>
        <h1>Онлайн-квиз для друзей</h1>
      </div>

      <button type="button" onClick={onCheckServer}>
        Проверить сервер
      </button>
      <p role="status">{serverMessage}</p>

      <form
        onSubmit={onJoin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
        }}
      >
        <h2>Присоединиться к игре</h2>
        <input
          type="text"
          placeholder="Код комнаты (6 символов)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          required
        />
        <input
          type="text"
          placeholder="Ваш никнейм"
          value={joinNickname}
          onChange={(e) => setJoinNickname(e.target.value)}
          maxLength={20}
          required
        />
        <button type="submit" disabled={isJoining}>
          {isJoining ? "Входим…" : "Войти в игру"}
        </button>
        {joinError && (
          <p role="alert" style={{ color: "red" }}>
            {joinError}
          </p>
        )}
      </form>

      <hr style={{ width: "100%", margin: "20px 0" }} />

      <button
        type="button"
        onClick={onLoadQuizzes}
        disabled={quizzesStatus === "loading"}
      >
        Загрузить квизы
      </button>
      <p role="status">{statusMessages[quizzesStatus]}</p>

      {quizzesStatus === "success" &&
        (quizzes.length === 0 ? (
          <p>Пока нет доступных квизов</p>
        ) : (
          <div>
            <ul>
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <span>
                    {quiz.title} - вопросов: {quiz.questionCount}
                  </span>{" "}
                  <button
                    type="button"
                    onClick={() => onCreateRoom(quiz.id)}
                    disabled={isCreatingRoom}
                  >
                    {isCreatingRoom ? "Создаем..." : "Создать комнату"}
                  </button>
                </li>
              ))}
            </ul>
            {createRoomError && (
              <p role="alert" style={{ color: "red" }}>
                {createRoomError}
              </p>
            )}
          </div>
        ))}
    </section>
  );
}
