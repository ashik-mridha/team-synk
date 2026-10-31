import { io } from 'socket.io-client';

let socket = null;

/**
 * One shared connection. Authentication is the Better Auth session cookie, sent automatically
 * (`withCredentials`); the client never passes a user id or token.
 */
export function getSocket() {
  socket ??= io(process.env.NEXT_PUBLIC_SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}

export function connectSocket() {
  const instance = getSocket();
  if (!instance.active) instance.connect();
  return instance;
}

export function disconnectSocket() {
  socket?.disconnect();
}

/** Promise wrapper around an emit with acknowledgement. */
export function emitWithAck(event, payload) {
  return new Promise((resolve) => getSocket().emit(event, payload, resolve));
}

/** A fresh id for each mutation so the sender can recognise (and skip) the socket echo of it. */
export const newMutationId = () => crypto.randomUUID();
