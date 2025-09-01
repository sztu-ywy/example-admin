// src/views/user/columns.ts
import type { StdTableColumn } from '@uozi-admin/curd'
import { h } from 'vue'
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
    dataIndex: 'username',
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
  // 真实姓名一列
  {
    title: '真实姓名',
    dataIndex: 'name',
    search: true,
    edit: {
      type: 'input',
      formItem: {
        required: true,
        rules: [
          { min: 2, max: 50, message: '真实姓名长度为 2-50 个字符' },
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
        required: false,
        rules: [
          { type: 'email', message: '请输入正确的邮箱格式' },
        ],
      },
    },
  },
  // 手机号一列
  {
    title: '手机号',
    dataIndex: 'phone',
    edit: {
      type: 'input',
      formItem: {
        required: false,
        rules: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
        ],
      },
    },
  },
  // 性别一列
  {
    title: '性别',
    dataIndex: 'gender',
    edit: {
      type: 'select',
      select: {
        options: [
          { label: '男', value: 'M' },
          { label: '女', value: 'F' },
        ],
      },
    },
    customRender: ({ text: value }) => {
      const genderMap = {
        'M': { text: '男', color: 'blue' },
        'F': { text: '女', color: 'pink' },
      }
      const gender = genderMap[value] || { text: '未知', color: 'gray' }
      return h('span', { style: `color: ${gender.color}` }, gender.text)
    },
  },
  // 学号一列（仅学生需要）
  {
    title: '学号',
    dataIndex: 'student_no',
    search: true,
    edit: {
      type: 'input',
      formItem: {
        required: false,
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
    title: '角色',
    dataIndex: 'role',
    search: true,
    edit: {
      type: 'select',
      formItem: {
        required: true,
      },
      select: {
        options: [
          { label: '管理员', value: 'ADMIN' },
          { label: '宿管员', value: 'DORM_MANAGER' },
          { label: '维修员', value: 'REPAIR_STAFF' },
          { label: '学生', value: 'STUDENT' },
        ],
      },
    },
    // 对角色的自定义渲染
    customRender: ({ text: value }) => {
      const roleMap = {
        'ADMIN': { text: '管理员', color: 'red' },
        'DORM_MANAGER': { text: '宿管员', color: 'blue' },
        'REPAIR_STAFF': { text: '维修员', color: 'green' },
        'STUDENT': { text: '学生', color: 'gray' },
      }
      const role = roleMap[value] || { text: '未知', color: 'gray' }
      return h('span', { style: `color: ${role.color}` }, role.text)
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
