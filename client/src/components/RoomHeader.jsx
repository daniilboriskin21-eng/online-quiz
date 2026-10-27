export function RoomHeader({
  currentRoom,
  currentUser,
  roomState,
  isLeaving,
  onLeave,
}) {
  return (
    <>
      <h1>Комната квиза</h1>
      <p>
        Квиз: <strong>{roomState?.room?.quizTitle || "Загрузка..."}</strong>{" "}
        (вопросов: {roomState?.room?.questionCount || 0})
      </p>
      <p>
        Код для друзей: <strong>{currentRoom?.code}</strong>
      </p>
      <p>
        Вы вошли как: <strong>{currentUser?.nickname || "Ведущий"}</strong> (
        {currentUser?.role === "host" ? "Ведущий" : "Игрок"})
      </p>

      <button
        type="button"
        onClick={onLeave}
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
    </>
  );
}
