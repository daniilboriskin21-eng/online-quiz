export async function createRoom(quizId) {
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
  return result.data;
}

export async function joinRoom(code, nickname) {
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
  return result.data;
}

export async function fetchRoom(code) {
  const response = await fetch(`/api/rooms/${code}`);
  if (!response.ok) {
    if (
      response.status === 404 ||
      response.status === 401 ||
      response.status === 403
    ) {
      return null;
    }
    throw new Error("Сервер временно недоступен. Проверьте соединение.");
  }
  const result = await response.json();
  return result.data;
}
