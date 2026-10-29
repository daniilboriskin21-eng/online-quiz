export async function checkHealth() {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Ошибка HTTP");
  }
  return response.json();
}

export async function fetchQuizzes() {
  const response = await fetch("/api/quizzes");
  if (!response.ok) {
    throw new Error("Не удалось загрузить квизы");
  }
  const data = await response.json();
  return data.data;
}
