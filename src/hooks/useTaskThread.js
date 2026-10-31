'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { SocketEvent } from '@/lib/constants';
import { getSocket, newMutationId } from '@/lib/socket';

const TYPING_TIMEOUT_MS = 3500;

/**
 * Comments + activity for one task, live. Comments arrive over the socket (the sender's own echo
 * is skipped by mutation id), and `typing` lists teammates currently writing a comment.
 */
export function useTaskThread(taskId) {
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState({});
  const mine = useRef(new Set());
  const timers = useRef({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get(`/tasks/${taskId}/comments`, { silent: true }),
      api.get(`/tasks/${taskId}/activity`, { silent: true }),
    ])
      .then(([c, a]) => {
        if (cancelled) return;
        setComments(c.data.data.comments);
        setActivity(a.data.data.activity);
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  useEffect(() => {
    const socket = getSocket();
    const timersAtMount = timers.current;

    const onCreated = ({ comment, taskId: from, clientMutationId }) => {
      if (from !== taskId || mine.current.has(clientMutationId)) return;
      setComments((list) => (list.some((c) => c.id === comment.id) ? list : [...list, comment]));
    };
    const onUpdated = ({ comment, taskId: from }) => {
      if (from !== taskId) return;
      setComments((list) => list.map((c) => (c.id === comment.id ? comment : c)));
    };
    const onTyping = ({ taskId: from, typing: isTyping, user }) => {
      if (from !== taskId) return;
      clearTimeout(timersAtMount[user.id]);
      setTyping((state) => {
        const next = { ...state };
        if (isTyping) next[user.id] = user.name;
        else delete next[user.id];
        return next;
      });
      // A dropped connection would never send "stopped typing", so the indicator expires itself.
      if (isTyping) {
        timersAtMount[user.id] = setTimeout(
          () =>
            setTyping((state) => {
              const next = { ...state };
              delete next[user.id];
              return next;
            }),
          TYPING_TIMEOUT_MS,
        );
      }
    };

    socket.on(SocketEvent.COMMENT_CREATED, onCreated);
    socket.on(SocketEvent.COMMENT_UPDATED, onUpdated);
    socket.on(SocketEvent.TYPING, onTyping);
    return () => {
      socket.off(SocketEvent.COMMENT_CREATED, onCreated);
      socket.off(SocketEvent.COMMENT_UPDATED, onUpdated);
      socket.off(SocketEvent.TYPING, onTyping);
      Object.values(timersAtMount).forEach(clearTimeout);
    };
  }, [taskId]);

  const addComment = useCallback(
    async (body, mentions) => {
      const id = newMutationId();
      mine.current.add(id);
      const res = await api.post(
        `/tasks/${taskId}/comments`,
        { body, mentions },
        { headers: { 'x-client-mutation-id': id } },
      );
      setComments((list) => [...list, res.data.data.comment]);
      return res.data.data.comment;
    },
    [taskId],
  );

  const react = useCallback(async (commentId, emoji) => {
    const res = await api.post(`/comments/${commentId}/reactions`, { emoji });
    setComments((list) => list.map((c) => (c.id === commentId ? res.data.data.comment : c)));
  }, []);

  const sendTyping = useCallback(
    (isTyping) => {
      const socket = getSocket();
      if (socket.connected) socket.emit(SocketEvent.TYPING, { taskId, typing: isTyping });
    },
    [taskId],
  );

  return {
    comments,
    activity,
    loading,
    typing: Object.values(typing),
    addComment,
    react,
    sendTyping,
  };
}
