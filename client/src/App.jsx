import { useState } from "react";
import "./App.css";

function App() {
  const [serverMessage, setServerMessage] = useState("Сервер еще не проверен");
  const [quizzes, setQuizzes] = useState([]);
  const [quizzesStatus, setQuizzesStatus] = useState("idle");

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
            <ul>
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  {quiz.title} - вопросов: {quiz.questionCount}
                </li>
              ))}
            </ul>
          ))}
      </section>
    </>
  );
}

export default App;
