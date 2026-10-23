import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

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
          return;
        }

        const sessionData = await response.json();
        if (!sessionData.data?.roomCode) {
          return;
        }

        const roomResponse = await fetch(
          `/api/rooms/${sessionData.data.roomCode}`,
        );
        if (!roomResponse.ok) {
          return;
        }

        const roomResult = await roomResponse.json();
        if (!ignore) {
          setCurrentRoom(roomResult.data.room);
          setCurrentUser(roomResult.data.me);
        }
      } catch (error) {
        console.error("Ошибка восстановления сессии:", error);
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
    };
  }, [currentRoom]);

  if (isCheckingSession) {
    return (
      <section id="center">
        <p>Загрузка...</p>
      </section>
    );
  }

  if (currentRoom) {
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
          Статус:{" "}
          {currentRoom.status === "lobby"
            ? "Ожидание игроков"
            : currentRoom.status}
        </p>

        <p>
          Вы вошли как: <strong>{currentUser?.nickname || "Ведущий"}</strong> (
          {currentUser?.role === "host" ? "Ведущий" : "Игрок"})
        </p>

        <hr style={{ width: "100%", margin: "15px 0" }} />

        <p>Ведущий: {roomState?.hostOnline ? "🟢 в сети" : "⚪ не в сети"}</p>

        <h3>Игроки в лобби ({roomState?.players?.length ?? 0}):</h3>
        {roomState?.players?.length === 0 ? (
          <p>Пока никто не присоединился. Отправьте код друзьям!</p>
        ) : (
          <ul>
            {roomState?.players.map((player) => (
              <li key={player.id}>
                <span>{player.nickname}</span>{" "}
                <small>{player.online ? "🟢 в сети" : "⚪ не в сети"}</small>
              </li>
            ))}
          </ul>
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
