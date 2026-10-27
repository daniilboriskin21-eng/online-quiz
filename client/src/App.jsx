import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

import { ConnectionError } from "./components/ConnectionError.jsx";
import { HomeView } from "./components/HomeView.jsx";
import { RoomHeader } from "./components/RoomHeader.jsx";
import { LobbyView } from "./components/LobbyView.jsx";
import { QuestionView } from "./components/QuestionView.jsx";
import { RoundResultsView } from "./components/RoundResultsView.jsx";
import { FinishedView } from "./components/FinishedView.jsx";

const STATUS_MESSAGES = {
  idle: "Нажмите, чтобы загрузить квизы",
  loading: "Загружаем…",
  success: "Квизы загружены",
  error: "Не удалось загрузить квизы",
};

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
      <ConnectionError
        error={sessionError}
        onRetry={() => {
          setSessionError("");
          setIsCheckingSession(true);
          window.location.reload();
        }}
      />
    );
  }

  if (currentRoom) {
    const currentStatus = roomState?.room.status || currentRoom.status;

    return (
      <section id="center">
        <RoomHeader
          currentRoom={currentRoom}
          currentUser={currentUser}
          roomState={roomState}
          isLeaving={isLeaving}
          onLeave={handleLeaveGame}
        />

        {currentStatus === "lobby" && (
          <LobbyView
            roomState={roomState}
            currentUser={currentUser}
            isStartingGame={isStartingGame}
            onStartGame={handleStartGame}
            startGameError={startGameError}
          />
        )}

        {currentStatus === "question" && roomState?.round && (
          <QuestionView
            roomState={roomState}
            currentUser={currentUser}
            isSubmitting={isSubmitting}
            onSubmitAnswer={handleSubmitAnswer}
            submitError={submitError}
          />
        )}

        {currentStatus === "round_results" && roomState?.round && (
          <RoundResultsView
            roomState={roomState}
            currentUser={currentUser}
            isContinuing={isContinuing}
            onContinue={handleContinueGame}
            continueError={continueError}
          />
        )}

        {currentStatus === "finished" && (
          <FinishedView
            roomState={roomState}
            currentUser={currentUser}
            isLeaving={isLeaving}
            onLeave={handleLeaveGame}
          />
        )}
      </section>
    );
  }

  return (
    <HomeView
      serverMessage={serverMessage}
      onCheckServer={checkServer}
      joinCode={joinCode}
      setJoinCode={setJoinCode}
      joinNickname={joinNickname}
      setJoinNickname={setJoinNickname}
      joinError={joinError}
      isJoining={isJoining}
      onJoin={handleJoin}
      quizzes={quizzes}
      quizzesStatus={quizzesStatus}
      onLoadQuizzes={loadQuizzes}
      statusMessages={STATUS_MESSAGES}
      onCreateRoom={createRoom}
      isCreatingRoom={isCreatingRoom}
      createRoomError={createRoomError}
    />
  );
}

export default App;
