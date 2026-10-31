import { io } from 'socket.io-client';
import { api } from '@/lib/api';
import { SOCKET_URL } from '@/lib/config';

let socket = null;

/**
 * One shared connection, made directly to the API host (WebSockets cannot go through a rewrite).
 *
 * Authentication never trusts the client: before each (re)connect we ask the API for a one-time,
 * 30-second ticket using the signed-in session, and the server resolves it to the user. This works
 * even when the browser will not send the session cookie to the API's domain (third-party cookie
 * blocking). `withCredentials` additionally lets the cookie travel when the browser allows it.
 */
export function getSocket() {
  socket ??= io(SOCKET_URL || undefined, {
    withCredentials: true,
    autoConnect: false,
    auth: (callback) => {
      api
        .post('/socket-ticket', null, { silent: true })
        .then((res) => callback({ ticket: res.data.data.ticket }))
        .catch(() => callback({}));
    },
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
