import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

function Timer({ endsAt }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000),
      );

      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <strong
      style={{
        fontSize: "1.2rem",
        color: secondsLeft <= 5 ? "red" : "inherit",
      }}
    >
      ⏱️ {secondsLeft} сек.
    </strong>
  );
}

function App() {
  const [serverMessage, setServerMessage] = useState("Сервер еще не проверен");
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesStatus, setQuizzesStatus] = useState("idle");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [createRoomError, setCreateRoomError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [joinCode, setJoinCode] = useState("");
  const [joinNickname, setJoinNickname] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [roomState, setRoomState] = useState(null);

  const socketRef = useRef(null);
  const [startGameError, setStartGameError] = useState("");
  const [isStartingGame, setIsStartingGame] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  const [sessionError, setSessionError] = useState("");

  function handleContinueGame() {
    if (!socketRef.current) return;
    setIsContinuing(true);
    setContinueError("");

    socketRef.current.emit("game:continue", {}, (response) => {
      setIsContinuing(false);
      if (!response?.ok) {
        setContinueError(
          response?.error?.message || "Не удалось продолжить игру",
        );
      }
    });
  }

  async function handleLeaveGame() {
    setIsLeaving(true);

    try {
      await fetch("/api/session/leave", { method: "POST" });
      setCurrentRoom(null);
      setCurrentUser(null);
      setRoomState(null);
    } catch (error) {
      console.error("Ошибка при выходе из игры:", error);
    } finally {
      setIsLeaving(false);
    }
  }

  function handleSubmitAnswer(optionId) {
    if (!socketRef.current || !roomState?.round) return;
    setIsSubmitting(true);
    setSubmitError("");

    socketRef.current.emit(
      "answer:submit",
      { roundId: roomState.round.id, optionId },
      (response) => {
        setIsSubmitting(false);
        if (!response?.ok) {
          setSubmitError(
            response?.error?.message || "Не удалось отправить ответ",
          );
        }
      },
    );
  }

  function handleStartGame() {
    if (!socketRef.current) return;
    setIsStartingGame(true);
    setStartGameError("");

    socketRef.current.emit("game:start", {}, (response) => {
      setIsStartingGame(false);
      if (!response?.ok) {
        setStartGameError(response?.error?.message || "Не удалось начать игру");
      }
    });
  }

  async function handleJoin(e) {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");

    try {
      const code = joinCode.trim().toUpperCase();
      const nickname = joinNickname.trim();

      const response = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Не удалось войти в комнату");
      }

      setCurrentRoom(result.data.room);
      setCurrentUser(result.data.me);
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsJoining(false);
    }
  }

  async function loadQuizzes() {
    setQuizzesStatus("loading");
    try {
      const response = await fetch("/api/quizzes");
      if (!response.ok) {
        throw new Error("error");
      }

      const data = await response.json();
      setQuizzes(data.data);
      setQuizzesStatus("success");
    } catch {
      setQuizzesStatus("error");
    }
  }

  async function createRoom(quizId) {
    setIsCreatingRoom(true);
    setCreateRoomError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Не удалось создать комнату");
      }

      setCurrentRoom(result.data.room);
      setCurrentUser(result.data.me);
    } catch (error) {
      setCreateRoomError(error.message);
    } finally {
      setIsCreatingRoom(false);
    }
  }

  async function checkServer() {
    setServerMessage("Проверяем...");
    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error("Ошибка HTTP");
      }

      const data = await response.json();
      setServerMessage(`Статус сервера: ${data.status}`);
    } catch {
      setServerMessage("Не удалось связаться с сервером");
    }
  }

  const statusMessages = {
    idle: "Нажмите, чтобы загрузить квизы",
    loading: "Загружаем…",
    success: "Квизы загружены",
    error: "Не удалось загрузить квизы",
  };

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) {
          throw new Error("Сервер временно недоступен. Проверьте соединение.");
        }

        const sessionData = await response.json();
        if (!sessionData.data?.roomCode) {
          // Сессии действительно нет — показываем главное меню
          return;
        }

        const roomResponse = await fetch(
          `/api/rooms/${sessionData.data.roomCode}`,
        );
        if (!roomResponse.ok) {
          if (
            roomResponse.status === 404 ||
            roomResponse.status === 401 ||
            roomResponse.status === 403
          ) {
            // Комната удалена или сессия истекла — выходим в меню
            return;
          }
          throw new Error("Сервер временно недоступен. Проверьте соединение.");
        }

        const roomResult = await roomResponse.json();
        if (!ignore) {
          setCurrentRoom(roomResult.data.room);
          setCurrentUser(roomResult.data.me);
        }
      } catch (error) {
        console.error("Ошибка восстановления сессии:", error);
        if (!ignore) {
          setSessionError(
            error.message ||
              "Сервер временно недоступен. Проверьте соединение.",
          );
        }
      } finally {
        if (!ignore) {
          setIsCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!currentRoom) return;

    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Сокет успешно подключен к серверу! ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Ошибка подключения сокета:", err.message);
    });

    socket.on("room:state", (state) => {
      console.log("Получено живое состояние комнаты:", state);
      setRoomState(state);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentRoom]);

  if (isCheckingSession) {
    return (
      <section id="center">
        <p>Загрузка...</p>
      </section>
    );
  }

  if (sessionError) {
    return (
      <section id="center">
        <h2>🔴 Ошибка подключения</h2>
        <p style={{ color: "red" }}>{sessionError}</p>
        <button
          type="button"
          onClick={() => {
            setSessionError("");
            setIsCheckingSession(true);
            // При клике повторно вызываем проверку сессии или перезагружаем
            window.location.reload();
          }}
          style={{ padding: "10px 20px", marginTop: "15px", cursor: "pointer" }}
        >
          Попробовать снова
        </button>
      </section>
    );
  }

  if (currentRoom) {
    const currentStatus = roomState?.room.status || currentRoom.status;

    return (
      <section id="center">
        <h1>Комната квиза</h1>
        <p>
          Квиз: <strong>{roomState?.room.quizTitle || "Загрузка..."}</strong>{" "}
          (вопросов: {roomState?.room.questionCount || 0})
        </p>
        <p>
          Код для друзей: <strong>{currentRoom.code}</strong>
        </p>
        <p>
          Вы вошли как: <strong>{currentUser?.nickname || "Ведущий"}</strong> (
          {currentUser?.role === "host" ? "Ведущий" : "Игрок"})
        </p>

        <button
          type="button"
          onClick={handleLeaveGame}
          disabled={isLeaving}
          style={{
            padding: "5px 12px",
            fontSize: "0.85rem",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {isLeaving ? "Выходим..." : "Покинуть комнату"}
        </button>

        <hr style={{ width: "100%", margin: "15px 0" }} />

        {/* 1. ЭКРАН ЛОББИ */}
        {currentStatus === "lobby" && (
          <div>
            <p>
              Статус: <strong>Ожидание игроков</strong>
            </p>
            <p>
              Ведущий: {roomState?.hostOnline ? "🟢 в сети" : "⚪ не в сети"}
            </p>

            <h3>Игроки в лобби ({roomState?.players?.length ?? 0}):</h3>
            {roomState?.players?.length === 0 ? (
              <p>Пока никто не присоединился. Отправьте код друзьям!</p>
            ) : (
              <ul>
                {roomState?.players.map((player) => (
                  <li key={player.id}>
                    <span>{player.nickname}</span>{" "}
                    <small>
                      {player.online ? "🟢 в сети" : "⚪ не в сети"}
                    </small>
                  </li>
                ))}
              </ul>
            )}

            {currentUser?.role === "host" && (
              <div style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleStartGame}
                  disabled={
                    isStartingGame || (roomState?.players?.length ?? 0) === 0
                  }
                  style={{
                    padding: "10px 20px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                  }}
                >
                  {isStartingGame ? "Запускаем…" : "Начать игру"}
                </button>
                {(roomState?.players?.length ?? 0) === 0 && (
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.9rem",
                      marginTop: "8px",
                    }}
                  >
                    Для старта нужен хотя бы один игрок
                  </p>
                )}
                {startGameError && (
                  <p role="alert" style={{ color: "red" }}>
                    {startGameError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. ЭКРАН ВОПРОСА */}
        {currentStatus === "question" && roomState?.round && (
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                Вопрос {roomState.round.number} из{" "}
                {roomState.room.questionCount}
              </span>
              <Timer endsAt={roomState.round.endsAt} />
            </div>

            <h2 style={{ margin: "20px 0" }}>
              {roomState.round.question.text}
            </h2>

            {currentUser?.role === "host" ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                Вы ведущий. Игроки выбирают ответы...
              </p>
            ) : roomState?.myAnswer ? (
              <p style={{ color: "green", fontWeight: "bold" }}>
                ✅ Ваш ответ принят! Ожидаем окончания времени...
              </p>
            ) : (
              <p style={{ color: "#666" }}>Выберите вариант ответа:</p>
            )}

            <div className="options-grid">
              {roomState.round.question.options.map((option) => {
                const isSelected = roomState?.myAnswer?.optionId === option.id;
                const isDisabled =
                  currentUser?.role === "host" ||
                  Boolean(roomState?.myAnswer) ||
                  isSubmitting;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSubmitAnswer(option.id)}
                    disabled={isDisabled}
                    style={{
                      padding: "15px",
                      fontSize: "1rem",
                      cursor: isDisabled ? "default" : "pointer",
                      border: isSelected
                        ? "3px solid #2196F3"
                        : "1px solid #ccc",
                      backgroundColor: isSelected ? "#e3f2fd" : "inherit",
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    {isSelected && "✓ "}
                    {option.text}
                  </button>
                );
              })}
            </div>

            {submitError && (
              <p role="alert" style={{ color: "red", marginTop: "10px" }}>
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* 3. ЭКРАН РЕЗУЛЬТАТОВ РАУНДА */}
        {currentStatus === "round_results" && roomState?.round && (
          <div
            style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}
          >
            <h2>⏰ Время вышло!</h2>
            <h3 style={{ margin: "15px 0" }}>
              {roomState.round.question.text}
            </h3>

            <div className="options-grid" style={{ marginBottom: "25px" }}>
              {roomState.round.question.options.map((option) => {
                const isCorrect =
                  roomState?.results?.correctOptionId === option.id;
                const isMyChoice = roomState?.myAnswer?.optionId === option.id;

                let border = "1px solid #ccc";
                let bg = "inherit";

                if (isCorrect) {
                  border = "3px solid #4CAF50";
                  bg = "#e8f5e9";
                } else if (isMyChoice && !isCorrect) {
                  border = "3px solid #f44336";
                  bg = "#ffebee";
                }

                return (
                  <div
                    key={option.id}
                    style={{
                      padding: "15px",
                      fontSize: "1rem",
                      border,
                      backgroundColor: bg,
                      borderRadius: "6px",
                      fontWeight: isCorrect || isMyChoice ? "bold" : "normal",
                    }}
                  >
                    {isCorrect && "🟢 "}
                    {isMyChoice && !isCorrect && "🔴 "}
                    {option.text}
                    {isCorrect && " (Верно!)"}
                  </div>
                );
              })}
            </div>

            {roomState?.results?.leaderboard && (
              <div>
                <h3>🏆 Таблица лидеров</h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ccc" }}>
                      <th style={{ padding: "8px" }}>Место</th>
                      <th style={{ padding: "8px" }}>Игрок</th>
                      <th style={{ padding: "8px" }}>Очки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomState.results.leaderboard.map((p) => {
                      const isMe = p.memberId === currentUser?.memberId;
                      return (
                        <tr
                          key={p.memberId}
                          style={{
                            borderBottom: "1px solid #eee",
                            fontWeight: isMe ? "bold" : "normal",
                            backgroundColor: isMe ? "#f5f5f5" : "inherit",
                          }}
                        >
                          <td style={{ padding: "8px" }}>#{p.place}</td>
                          <td style={{ padding: "8px" }}>
                            {p.nickname} {isMe && "(Вы)"}
                          </td>
                          <td style={{ padding: "8px" }}>{p.score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {currentUser?.role === "host" ? (
              <div style={{ marginTop: "25px" }}>
                <button
                  type="button"
                  onClick={handleContinueGame}
                  disabled={isContinuing}
                  style={{
                    padding: "12px 24px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {isContinuing
                    ? "Загружаем…"
                    : roomState.round.number < roomState.room.questionCount
                      ? "Следующий вопрос →"
                      : "Показать итоги игры 🏆"}
                </button>
                {continueError && (
                  <p role="alert" style={{ color: "red", marginTop: "10px" }}>
                    {continueError}
                  </p>
                )}
              </div>
            ) : (
              <p
                style={{
                  marginTop: "20px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Ожидаем, пока ведущий продолжит игру...
              </p>
            )}
          </div>
        )}

        {/* 4. ЭКРАН ИТОГОВ ИГРЫ (ФИНАЛ) */}
        {currentStatus === "finished" && (
          <div
            style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}
          >
            <h2>🎉 Игра завершена!</h2>
            <p style={{ color: "#666" }}>
              Квиз: <strong>{roomState?.room.quizTitle}</strong>
            </p>

            {roomState?.results?.leaderboard && (
              <div style={{ marginTop: "20px" }}>
                <h3>🏆 Итоговый пьедестал</h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "15px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ccc" }}>
                      <th style={{ padding: "10px" }}>Место</th>
                      <th style={{ padding: "10px" }}>Игрок</th>
                      <th style={{ padding: "10px" }}>Баллы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomState.results.leaderboard.map((p) => {
                      const isMe = p.memberId === currentUser?.memberId;
                      const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

                      return (
                        <tr
                          key={p.memberId}
                          style={{
                            borderBottom: "1px solid #eee",
                            fontWeight: isMe ? "bold" : "normal",
                            backgroundColor: isMe ? "#f5f5f5" : "inherit",
                          }}
                        >
                          <td style={{ padding: "10px", fontSize: "1.1rem" }}>
                            {medals[p.place] || `#${p.place}`}
                          </td>
                          <td style={{ padding: "10px" }}>
                            {p.nickname} {isMe && "(Вы)"}
                          </td>
                          <td style={{ padding: "10px", fontWeight: "bold" }}>
                            {p.score}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: "30px" }}>
              <button
                type="button"
                onClick={handleLeaveGame}
                disabled={isLeaving}
                style={{
                  padding: "12px 24px",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                {isLeaving ? "Выходим..." : "Выйти в главное меню"}
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <section id="center">
        <div>
          <h1>Онлайн-квиз для друзей</h1>
        </div>

        <button type="button" onClick={checkServer}>
          Проверить сервер
        </button>
        <p role="status">{serverMessage}</p>

        <form
          onSubmit={handleJoin}
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
          onClick={loadQuizzes}
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
                      onClick={() => createRoom(quiz.id)}
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
    </>
  );
}

export default App;
