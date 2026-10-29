const memberSockets = new Map(); // memberId -> Set(socket.id)

export function addMemberSocket(memberId, socketId) {
  if (!memberSockets.has(memberId)) {
    memberSockets.set(memberId, new Set());
  }
  memberSockets.get(memberId).add(socketId);
}

export function removeMemberSocket(memberId, socketId) {
  const sockets = memberSockets.get(memberId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      memberSockets.delete(memberId);
    }
  }
}

export function isMemberOnline(memberId) {
  const sockets = memberSockets.get(memberId);
  return Boolean(sockets && sockets.size > 0);
}
