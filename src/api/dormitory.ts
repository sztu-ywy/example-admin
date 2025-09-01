import { http } from '@uozi-admin/request'

// 楼栋管理 API
export const buildingApi = {
  // 获取楼栋列表
  getList: (params?: any) => {
    return http.get('/admin/buildings', { params })
  },

  // 创建楼栋
  create: (data: any) => {
    return http.post('/admin/buildings', data)
  },

  // 更新楼栋
  update: (id: number, data: any) => {
    return http.put(`/admin/buildings/${id}`, data)
  },

  // 删除楼栋
  delete: (id: number) => {
    return http.delete(`/admin/buildings/${id}`)
  },

  // 获取楼栋统计信息
  getStatistics: (id: number) => {
    return http.get(`/admin/buildings/${id}/statistics`)
  },
}

// 房间管理 API
export const roomApi = {
  // 获取房间列表
  getList: (params?: any) => {
    return http.get('/admin/rooms', { params })
  },

  // 创建房间
  create: (data: any) => {
    return http.post('/admin/rooms', data)
  },

  // 更新房间
  update: (id: number, data: any) => {
    return http.put(`/admin/rooms/${id}`, data)
  },

  // 删除房间
  delete: (id: number) => {
    return http.delete(`/admin/rooms/${id}`)
  },

  // 获取房间床位列表
  getBeds: (id: number) => {
    return http.get(`/admin/rooms/${id}/beds`)
  },

  // 获取房间学生列表
  getStudents: (id: number) => {
    return http.get(`/admin/rooms/${id}/students`)
  },

  // 根据楼栋获取房间列表
  getByBuilding: (buildingId: number) => {
    return http.get(`/admin/rooms`, { params: { buildingId } })
  },
}

// 学生住宿管理 API
export const studentApi = {
  // 获取住宿学生列表
  getList: (params?: any) => {
    return http.get('/admin/students', { params })
  },

  // 分配宿舍
  assign: (data: any) => {
    return http.post('/admin/students', data)
  },

  // 批量分配宿舍
  batchAssign: (data: any) => {
    return http.post('/admin/students/batch-assign', data)
  },

  // 自动分配宿舍
  autoAssign: (data: any) => {
    return http.post('/admin/students/auto-assign', data)
  },

  // 学生退宿
  checkOut: (id: number) => {
    return http.delete(`/admin/students/${id}`)
  },

  // 获取未分配学生列表
  getUnassigned: () => {
    return http.get('/admin/students/unassigned')
  },

  // 更新住宿信息
  update: (id: number, data: any) => {
    return http.put(`/admin/students/${id}`, data)
  },

  // 删除住宿记录
  delete: (id: number) => {
    return http.delete(`/admin/students/${id}`)
  },
}

// 维修工单管理 API
export const repairApi = {
  // 获取工单列表
  getList: (params?: any) => {
    return http.get('/admin/repairs', { params })
  },

  // 创建工单
  create: (data: any) => {
    return http.post('/admin/repairs', data)
  },

  // 更新工单
  update: (id: number, data: any) => {
    return http.put(`/admin/repairs/${id}`, data)
  },

  // 删除工单
  delete: (id: number) => {
    return http.delete(`/admin/repairs/${id}`)
  },

  // 分配维修人员
  assign: (id: number, data: any) => {
    return http.put(`/admin/repairs/${id}/assign`, data)
  },

  // 更新工单状态
  updateStatus: (id: number, data: any) => {
    return http.put(`/admin/repairs/${id}/status`, data)
  },

  // 获取待处理工单
  getPending: () => {
    return http.get('/admin/repairs/pending')
  },

  // 添加工单留言
  addComment: (id: number, data: any) => {
    return http.post(`/admin/repairs/${id}/comments`, data)
  },

  // 获取工单留言
  getComments: (id: number) => {
    return http.get(`/admin/repairs/${id}/comments`)
  },
}

// 访客管理 API
export const visitApi = {
  // 获取访客列表
  getList: (params?: any) => {
    return http.get('/admin/visits', { params })
  },

  // 登记访客
  create: (data: any) => {
    return http.post('/admin/visits', data)
  },

  // 更新访客信息
  update: (id: number, data: any) => {
    return http.put(`/admin/visits/${id}`, data)
  },

  // 删除访客记录
  delete: (id: number) => {
    return http.delete(`/admin/visits/${id}`)
  },

  // 审核通过
  approve: (id: number, data?: any) => {
    return http.put(`/admin/visits/${id}/approve`, data)
  },

  // 审核拒绝
  reject: (id: number, data: any) => {
    return http.put(`/admin/visits/${id}/reject`, data)
  },

  // 获取待审核访客
  getPending: () => {
    return http.get('/admin/visits/pending')
  },

  // 结束访问
  finish: (id: number) => {
    return http.put(`/admin/visits/${id}/finish`)
  },
}

// 用户管理 API (扩展)
export const userApi = {
  // 获取维修人员列表
  getRepairStaff: () => {
    return http.get('/admin/users', { params: { role: 'REPAIR_STAFF' } })
  },

  // 获取学生列表
  getStudents: (params?: any) => {
    return http.get('/admin/users', { params: { role: 'STUDENT', ...params } })
  },

  // 获取宿舍管理员列表
  getDormManagers: () => {
    return http.get('/admin/users', { params: { role: 'DORM_MANAGER' } })
  },
}

// 床位管理 API
export const bedApi = {
  // 获取可用床位
  getAvailable: (params?: any) => {
    return http.get('/admin/beds/available', { params })
  },

  // 根据房间获取床位
  getByRoom: (roomId: number) => {
    return http.get(`/admin/beds`, { params: { roomId } })
  },
}

// 统计数据 API
export const statisticsApi = {
  // 获取仪表盘统计数据
  getDashboard: () => {
    return http.get('/admin/statistics/dashboard')
  },

  // 获取楼栋统计数据
  getBuilding: (id: number) => {
    return http.get(`/admin/statistics/building/${id}`)
  },

  // 获取入住率统计
  getOccupancy: (params?: any) => {
    return http.get('/admin/statistics/occupancy', { params })
  },

  // 获取维修工单统计
  getRepair: (params?: any) => {
    return http.get('/admin/statistics/repair', { params })
  },

  // 获取访客统计
  getVisit: (params?: any) => {
    return http.get('/admin/statistics/visit', { params })
  },
}

// 学生端 API
export const studentPortalApi = {
  // 获取我的维修工单
  getMyRepairs: () => {
    return http.get('/student/repairs/my')
  },

  // 提交维修工单
  submitRepair: (data: any) => {
    return http.post('/student/repairs', data)
  },

  // 获取我的访客记录
  getMyVisits: () => {
    return http.get('/student/visits/my')
  },

  // 登记访客
  registerVisit: (data: any) => {
    return http.post('/student/visits', data)
  },

  // 获取我的住宿信息
  getMyAccommodation: () => {
    return http.get('/student/accommodation/my')
  },
}

// 导出所有 API
export default {
  building: buildingApi,
  room: roomApi,
  student: studentApi,
  repair: repairApi,
  visit: visitApi,
  user: userApi,
  bed: bedApi,
  statistics: statisticsApi,
  studentPortal: studentPortalApi,
}
