export const Role = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
});

export const Priority = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

export const TaskStatus = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
});

export const STATUS_LABELS = Object.freeze({
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
});

export const PRIORITY_LABELS = Object.freeze({
  [Priority.LOW]: 'Low',
  [Priority.MEDIUM]: 'Medium',
  [Priority.HIGH]: 'High',
});

export const ROLE_LABELS = Object.freeze({
  [Role.OWNER]: 'Owner',
  [Role.ADMIN]: 'Admin',
  [Role.MEMBER]: 'Member',
  [Role.VIEWER]: 'Viewer',
});

/** Real-time events emitted by the server (mirrors server/src/config/constants.js). */
export const SocketEvent = Object.freeze({
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  PRESENCE: 'presence:update',
  TYPING: 'comment:typing',
  NOTIFICATION: 'notification:new',
  MEMBERS_CHANGED: 'members:changed',
});

export const MODAL = Object.freeze({
  CREATE_WORKSPACE: 'create-workspace',
  CREATE_PROJECT: 'create-project',
  INVITE: 'invite',
  CREATE_TASK: 'create-task',
  SHORTCUTS: 'shortcuts',
});
