import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [serverMessage, setServerMessage] = useState("Сервер еще не проверен");
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesStatus, setQuizzesStatus] = useState("idle");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [createRoomError, setCreateRoomError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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

  if (isCheckingSession) {
    return (
      <section id="center">
        <p>Загрузка...</p>
      </section>
    )
  }

  if (currentRoom) {
    return (
      <section id="center">
        <h1>Комната квиза</h1>
        <p>
          Код для друзей: <strong>{currentRoom.code}</strong>
        </p>
        <p>
          Статус:{" "}
          {currentRoom.status === "lobby"
            ? "Ожидание игроков"
            : currentRoom.status}
        </p>
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
