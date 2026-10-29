export async function fetchSession() {
  const response = await fetch("/api/session");
  if (!response.ok) {
    throw new Error("Сервер временно недоступен. Проверьте соединение.");
  }
  return response.json();
}

export async function leaveSession() {
  const response = await fetch("/api/session/leave", { method: "POST" });
  if (!response.ok) {
    throw new Error("Не удалось выйти из игры");
  }
  return response.json();
}
