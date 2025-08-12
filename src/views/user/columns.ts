// src/views/user/columns.ts
import type { StdTableColumn } from '@uozi-admin/curd'

import type { User } from '~/api/user'

import { datetimeRender } from '@uozi-admin/curd'
// 从左到右
export const columns: StdTableColumn<User>[] = [
// id 一列
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  // 用户名一列
  {
    title: '用户名',
    dataIndex: 'name',
    search: true,
    edit: {
      type: 'input',
      formItem: {
        required: true,
        rules: [
          { min: 3, max: 20, message: '用户名长度为 3-20 个字符' },
        ],
      },
    },
  },
  // 邮箱一列
  {
    title: '邮箱',
    dataIndex: 'email',
    edit: {
      type: 'input',
      formItem: {
        required: true,
        rules: [
          { type: 'email', message: '请输入正确的邮箱格式' },
        ],
      },
    },
  },
  {
    title: () => $pgettext('密码', 'Password'),
    dataIndex: 'password',
    edit: {
      type: 'password',
      password: {
        generate: true,
      },
    },
    hiddenInDetail: true,
    hiddenInTable: true,
  },
  {
    title: '用户组',
    dataIndex: 'user_group_id',
    edit: {
      type: 'select',
      select: {
        options: [
          { label: '管理员', value: 1 },
          { label: '普通用户', value: 0 },
        ],
      },
    },
    // 对状态一列的自定义渲染
    customRender: ({ text: value }) => {
      return value === 1
        ? h('span', { style: 'color: black' }, '管理员')
        : h('span', { style: 'color: gray' }, '普通用户')
    },

  },
  // 状态一列
  {
    title: '状态',
    dataIndex: 'status',
    search: true,
    edit: {
      type: 'select',
      select: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
    // 对状态一列的自定义渲染
    customRender: ({ text: value }) => {
      return value === 1
        ? h('span', { style: 'color: green' }, '启用')
        : h('span', { style: 'color: red' }, '禁用')
    },
  },
  // 不会渲染
  //   customRender: ({ text: value }) => {
  //   return value === 1 ?
  //     '<span style="color: green">启用</span>' :
  //     '<span style="color: red">禁用</span>'
  // }

  {
    title: '创建时间',
    dataIndex: 'created_at',
    customRender: datetimeRender,
    sorter: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    customRender: datetimeRender,
    sorter: true,
  },
  {
    title: () => $gettext('Actions'),
    dataIndex: 'actions',
  },
]
