export enum AUTH_ROLE {
  ADMIN = 'Admin',
  APP_SPECIALIST = 'Application Specialist',
  COMMISSIONER = 'Commissioner',
  LUP = 'LUP',
  GIS = 'GIS',
}

export const ROLES_ALLOWED_APPLICATIONS = [
  AUTH_ROLE.ADMIN,
  AUTH_ROLE.LUP,
  AUTH_ROLE.APP_SPECIALIST,
  AUTH_ROLE.GIS,
];

export const ROLES_ALLOWED_BOARDS = ROLES_ALLOWED_APPLICATIONS;
export const ANY_AUTH_ROLE = Object.values(AUTH_ROLE);
