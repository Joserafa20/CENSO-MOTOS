export const USER_ROLES = {
  ADMIN: 'admin',
  CENSISTA: 'censista',
  CIUDADANO: 'ciudadano',
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.CENSISTA]: 'Censista',
  [USER_ROLES.CIUDADANO]: 'Ciudadano',
};

export const USER_ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'vehicles:create',
    'vehicles:read',
    'vehicles:update',
    'vehicles:delete',
    'censos:create',
    'censos:read',
    'censos:update',
    'censos:delete',
    'censos:validate',
    'certificates:create',
    'certificates:read',
    'certificates:revoke',
    'stats:read',
    'reports:generate',
    'settings:manage',
  ],
  [USER_ROLES.CENSISTA]: [
    'censos:create',
    'censos:read:own',
    'censos:update:own',
    'vehicles:read',
    'certificates:read:own',
  ],
  [USER_ROLES.CIUDADANO]: [
    'vehicles:read:own',
    'censos:read:own',
    'certificates:read:own',
    'certificates:verify',
  ],
};

export function hasPermission(role: string, permission: string): boolean {
  return USER_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRoleLabel(role: string): string {
  return USER_ROLE_LABELS[role] ?? role;
}