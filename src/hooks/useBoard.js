'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SocketEvent } from '@/lib/constants';
import { connectSocket, emitWithAck, getSocket, newMutationId } from '@/lib/socket';

const ORDER_STEP = 1024;

const byOrder = (a, b) => a.order - b.order;
const isNewer = (incoming, existing) =>
  !existing || new Date(incoming.updatedAt) > new Date(existing.updatedAt);
const isGone = (task) => Boolean(task.deletedAt || task.archivedAt);

/** Applies one server task to a list: removes it when deleted/archived, ignores stale versions. */
function upsert(list, task) {
  const existing = list.find((t) => t.id === task.id);
  if (isGone(task)) return list.filter((t) => t.id !== task.id);
  if (!isNewer(task, existing)) return list;
  return (existing ? list.map((t) => (t.id === task.id ? task : t)) : [...list, task]).sort(
    byOrder,
  );
}

/**
 * Board data + mutations + real-time sync for one project.
 * - Mutations are optimistic and roll back on failure.
 * - Every mutation carries a client mutation id; the socket echo of our own change is ignored.
 * - Incoming events older than what we hold (by `updatedAt`) are ignored.
 * - After a reconnect the changes since the last event are fetched, then live updates resume.
 */
export function useBoard(projectId) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState(null);
  const [state, setState] = useState('loading');
  const [presence, setPresence] = useState([]);

  const mine = useRef(new Set());
  const lastSync = useRef(null);
  const tasksRef = useRef([]);
  const hasConnected = useRef(false);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const markSynced = useCallback((list) => {
    for (const t of list) {
      if (!lastSync.current || t.updatedAt > lastSync.current) lastSync.current = t.updatedAt;
    }
  }, []);

  /** Runs a request with a fresh mutation id attached, remembering the id for echo suppression. */
  const mutate = useCallback(async (request) => {
    const id = newMutationId();
    mine.current.add(id);
    setTimeout(() => mine.current.delete(id), 10_000);
    return request({ headers: { 'x-client-mutation-id': id } });
  }, []);

  const reload = useCallback(async () => {
    const res = await api.get(`/projects/${projectId}/tasks`, { silent: true });
    setTasks(res.data.data.tasks);
    markSynced(res.data.data.tasks);
  }, [projectId, markSynced]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`, { silent: true }),
          api.get(`/projects/${projectId}/tasks`),
        ]);
        const loaded = projectRes.data.data.project;
        if (cancelled) return;
        setProject(loaded);
        setRole(projectRes.data.data.role);
        setTasks(tasksRes.data.data.tasks);
        setMembers(projectRes.data.data.members);
        markSynced(tasksRes.data.data.tasks);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, markSynced]);

  // Live updates, presence and reconnect catch-up.
  useEffect(() => {
    if (state !== 'ready') return;
    const socket = connectSocket();

    async function join() {
      const res = await emitWithAck('project:join', projectId);
      if (res?.ok) setPresence(res.users);
    }

    async function catchUp() {
      if (!lastSync.current) return reload();
      const res = await api.get(`/projects/${projectId}/tasks`, {
        params: { since: lastSync.current },
        silent: true,
      });
      const changed = res.data.data.tasks;
      setTasks((list) => changed.reduce(upsert, list));
      markSynced(changed);
    }

    async function onConnect() {
      await join();
      // A reconnect may have missed events: fetch what changed, then carry on live.
      if (hasConnected.current) await catchUp().catch(() => undefined);
      hasConnected.current = true;
    }

    const onCreated = ({ task, clientMutationId }) => {
      if (task.project !== projectId) return;
      markSynced([task]);
      if (!mine.current.has(clientMutationId)) setTasks((list) => upsert(list, task));
    };
    const onUpdated = ({ task, clientMutationId, rebalanced }) => {
      if (task.project !== projectId) return;
      markSynced([task]);
      // Renumbered columns change other cards' positions, so refetch instead of patching one.
      if (rebalanced) return void reload();
      if (!mine.current.has(clientMutationId)) setTasks((list) => upsert(list, task));
    };
    const onDeleted = ({ id, projectId: from, clientMutationId }) => {
      if (from !== projectId || mine.current.has(clientMutationId)) return;
      setTasks((list) => list.filter((t) => t.id !== id));
    };
    const onPresence = ({ projectId: from, users }) => {
      if (from === projectId) setPresence(users);
    };
    const onMembers = async () => {
      if (!project) return;
      const res = await api.get(`/workspaces/${project.workspace}/members`, { silent: true });
      setMembers(res.data.data.members);
    };

    socket.on('connect', onConnect);
    socket.on(SocketEvent.TASK_CREATED, onCreated);
    socket.on(SocketEvent.TASK_UPDATED, onUpdated);
    socket.on(SocketEvent.TASK_DELETED, onDeleted);
    socket.on(SocketEvent.PRESENCE, onPresence);
    socket.on(SocketEvent.MEMBERS_CHANGED, onMembers);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off(SocketEvent.TASK_CREATED, onCreated);
      socket.off(SocketEvent.TASK_UPDATED, onUpdated);
      socket.off(SocketEvent.TASK_DELETED, onDeleted);
      socket.off(SocketEvent.PRESENCE, onPresence);
      socket.off(SocketEvent.MEMBERS_CHANGED, onMembers);
      if (socket.connected) socket.emit('project:leave');
      hasConnected.current = false;
    };
  }, [state, projectId, project, reload, markSynced]);

  const createTask = useCallback(
    async (input) => {
      const res = await mutate((config) => api.post(`/projects/${projectId}/tasks`, input, config));
      const task = res.data.data.task;
      setTasks((list) => upsert(list, task));
      markSynced([task]);
      return task;
    },
    [projectId, mutate, markSynced],
  );

  const updateTasks = useCallback(
    async (ids, patch) => {
      const previous = tasksRef.current;
      setTasks((list) => list.map((t) => (ids.includes(t.id) ? { ...t, ...patch } : t)));
      try {
        const results = await Promise.all(
          ids.map((id) => mutate((config) => api.patch(`/tasks/${id}`, patch, config))),
        );
        const saved = results.map((r) => r.data.data.task);
        setTasks((list) => saved.reduce((acc, task) => upsert(acc, { ...task }), list));
        markSynced(saved);
      } catch {
        setTasks(previous);
      }
    },
    [mutate, markSynced],
  );

  const moveTask = useCallback(
    async (id, { status, afterId = null, beforeId = null }) => {
      const previous = tasksRef.current;
      const find = (target) => previous.find((t) => t.id === target && t.id !== id);
      const prev = find(afterId);
      const next = find(beforeId);
      const column = previous.filter((t) => t.status === status && t.id !== id);
      let order;
      if (prev && next) order = (prev.order + next.order) / 2;
      else if (prev) order = prev.order + ORDER_STEP;
      else if (next) order = next.order - ORDER_STEP;
      else order = (column.at(-1)?.order ?? 0) + ORDER_STEP;

      setTasks((list) =>
        list.map((t) => (t.id === id ? { ...t, status, order } : t)).sort(byOrder),
      );
      try {
        const res = await mutate((config) =>
          api.post(`/tasks/${id}/move`, { status, afterId, beforeId }, config),
        );
        const { task, rebalanced } = res.data.data;
        if (rebalanced) await reload();
        else setTasks((list) => upsert(list, { ...task, updatedAt: task.updatedAt }));
        markSynced([task]);
      } catch {
        // The API client toasts the reason; put the card back where it was.
        setTasks(previous);
      }
    },
    [mutate, reload, markSynced],
  );

  const restoreTask = useCallback(
    async (id) => {
      const res = await mutate((config) => api.post(`/tasks/${id}/restore`, null, config));
      setTasks((list) => upsert(list, res.data.data.task));
    },
    [mutate],
  );

  const deleteTask = useCallback(
    async (id) => {
      const previous = tasksRef.current;
      setTasks((list) => list.filter((t) => t.id !== id));
      try {
        await mutate((config) => api.delete(`/tasks/${id}`, config));
        toast('Task deleted', {
          action: { label: 'Undo', onClick: () => restoreTask(id).catch(() => undefined) },
        });
      } catch {
        setTasks(previous);
      }
    },
    [mutate, restoreTask],
  );

  const setViewing = useCallback((taskId) => {
    const socket = getSocket();
    if (socket.connected) socket.emit('task:viewing', taskId ?? null);
  }, []);

  const membersById = useMemo(() => new Map(members.map((m) => [m.userId, m])), [members]);

  return {
    project,
    role,
    tasks,
    members,
    membersById,
    state,
    presence,
    createTask,
    updateTasks,
    moveTask,
    deleteTask,
    restoreTask,
    setViewing,
    reload,
  };
}
