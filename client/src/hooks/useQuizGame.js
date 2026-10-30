import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { checkHealth, fetchQuizzes } from "../api/quizzes.js";
import { fetchSession, leaveSession } from "../api/session.js";
import {
  createRoom as apiCreateRoom,
  joinRoom as apiJoinRoom,
  fetchRoom,
} from "../api/rooms.js";

export function useQuizGame() {
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

  async function checkServer() {
    setServerMessage("Проверяем...");
    try {
      const data = await checkHealth();
      setServerMessage(`Статус сервера: ${data.status}`);
    } catch {
      setServerMessage("Не удалось связаться с сервером");
    }
  }

  async function loadQuizzes() {
    setQuizzesStatus("loading");
    try {
      const data = await fetchQuizzes();
      setQuizzes(data);
      setQuizzesStatus("success");
    } catch {
      setQuizzesStatus("error");
    }
  }

  async function handleCreateRoom(quizId) {
    setIsCreatingRoom(true);
    setCreateRoomError("");
    try {
      const data = await apiCreateRoom(quizId);
      setCurrentRoom(data.room);
      setCurrentUser(data.me);
    } catch (error) {
      setCreateRoomError(error.message);
    } finally {
      setIsCreatingRoom(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setIsJoining(true);
    setJoinError("");
    try {
      const code = joinCode.trim().toUpperCase();
      const nickname = joinNickname.trim();
      const data = await apiJoinRoom(code, nickname);
      setCurrentRoom(data.room);
      setCurrentUser(data.me);
    } catch (error) {
      setJoinError(error.message);
    } finally {
      setIsJoining(false);
    }
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

  function handleSubmitAnswer(answer) {
    if (!socketRef.current || !roomState?.round) return;
    setIsSubmitting(true);
    setSubmitError("");

    const payload =
      typeof answer === "object"
        ? { roundId: roomState.round.id, ...answer }
        : { roundId: roomState.round.id, optionId: answer };

    socketRef.current.emit("answer:submit", payload, (response) => {
      setIsSubmitting(false);
      if (!response?.ok) {
        setSubmitError(
          response?.error?.message || "Не удалось отправить ответ",
        );
      }
    });
  }

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
      await leaveSession();
      setCurrentRoom(null);
      setCurrentUser(null);
      setRoomState(null);
    } catch (error) {
      console.error("Ошибка при выходе из игры:", error);
    } finally {
      setIsLeaving(false);
    }
  }

  function handleRetrySession() {
    setSessionError("");
    setIsCheckingSession(true);
    window.location.reload();
  }

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      try {
        const sessionData = await fetchSession();
        if (!sessionData.data?.roomCode) {
          return;
        }

        const roomData = await fetchRoom(sessionData.data.roomCode);
        if (roomData && !ignore) {
          setCurrentRoom(roomData.room);
          setCurrentUser(roomData.me);
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

  return {
    serverMessage,
    quizzes,
    quizzesStatus,
    currentRoom,
    currentUser,
    roomState,
    createRoomError,
    isCreatingRoom,
    isCheckingSession,
    sessionError,
    joinCode,
    setJoinCode,
    joinNickname,
    setJoinNickname,
    joinError,
    isJoining,
    startGameError,
    isStartingGame,
    submitError,
    isSubmitting,
    continueError,
    isContinuing,
    isLeaving,
    checkServer,
    loadQuizzes,
    handleCreateRoom,
    handleJoin,
    handleStartGame,
    handleSubmitAnswer,
    handleContinueGame,
    handleLeaveGame,
    handleRetrySession,
  };
}
