import type { MongoAbility } from '@casl/ability'
import type { ModelBase } from '~/api/types'
import { useCurdApi } from '@uozi-admin/request'

export interface UserGroup extends ModelBase {
  name: string
  permissions: Rules
}

export type Action = 'read' | 'write'
export type Subject = string

export interface Rule {
  action: Action
  subject: Subject
}

export type Rules = Rule[]

export type AppAbility = MongoAbility<[Action, Subject]>

export const userGroupApi = useCurdApi<UserGroup>('/admin/user_groups')
