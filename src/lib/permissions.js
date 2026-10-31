import { Role } from '@/lib/constants';

/**
 * UI-side mirror of the server's permission map, used only to hide or disable controls. The API
 * enforces the real rules (server/src/config/permissions.js), so this can never grant access.
 */
export const Action = Object.freeze({
  WRITE_TASKS: 'tasks:write',
  CREATE_PROJECT: 'project:create',
  MANAGE_MEMBERS: 'members:manage',
  MANAGE_INVITES: 'invites:manage',
  CHANGE_ROLES: 'members:roles',
});

const CONTRIBUTE = [Action.WRITE_TASKS, Action.CREATE_PROJECT];
const MANAGE = [...CONTRIBUTE, Action.MANAGE_MEMBERS, Action.MANAGE_INVITES, Action.CHANGE_ROLES];

const PERMISSIONS = {
  [Role.OWNER]: new Set(MANAGE),
  [Role.ADMIN]: new Set(MANAGE),
  [Role.MEMBER]: new Set(CONTRIBUTE),
  [Role.VIEWER]: new Set(),
};

export function can(role, action) {
  return PERMISSIONS[role]?.has(action) ?? false;
}
