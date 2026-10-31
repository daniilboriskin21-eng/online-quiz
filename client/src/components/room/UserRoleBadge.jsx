import { Crown, User } from "lucide-react";

export function UserRoleBadge({ isHost, nickname }) {
  if (isHost) {
    return (
      <span
        className="badge badge-host"
        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
      >
        <Crown size={13} /> Ведущий
      </span>
    );
  }

  return (
    <span
      className="badge badge-player"
      style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
    >
      <User size={13} /> {nickname || "Игрок"}
    </span>
  );
}
