export enum UserStatus {
  Active = 1,
  Ban = -1,
}

export const UserStatusMask = {
  [UserStatus.Active]: $gettext('Active'),
  [UserStatus.Ban]: $gettext('Ban'),
}
