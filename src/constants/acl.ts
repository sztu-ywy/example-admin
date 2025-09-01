export enum Acl {
  All = 'all',
  User = 'user',
  UserGroup = 'user_group',
  Building = 'building',
  Room = 'room',
  Student = 'student',
  Repair = 'repair',
  Visit = 'visit',
  Media = 'media',
  AuditLog = 'audit_log',
}

export const AclMask = {
  [Acl.All]: $pgettext('全部', 'All'),
  [Acl.User]: $pgettext('用户管理', 'User'),
  [Acl.UserGroup]: $pgettext('用户组管理', 'User Group'),
  [Acl.Building]: $pgettext('楼栋管理', 'Building'),
  [Acl.Room]: $pgettext('房间管理', 'Room'),
  [Acl.Student]: $pgettext('学生住宿', 'Student'),
  [Acl.Repair]: $pgettext('维修工单', 'Repair'),
  [Acl.Visit]: $pgettext('访客管理', 'Visit'),
  [Acl.Media]: $pgettext('媒体管理', 'Media'),
  [Acl.AuditLog]: $pgettext('审计日志', 'Audit Log'),
}
