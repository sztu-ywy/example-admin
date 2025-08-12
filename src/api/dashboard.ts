// import { http } from '~/lib/http'
import { http } from '@uozi-admin/request'

export interface BurnStatistics {
  date: string
  successCount: number
  failureCount: number
  totalCount: number
}

export interface DashboardStats {
  todaySuccess: number
  todayFailure: number
  todayTotal: number
  weeklyData: BurnStatistics[]
  monthlyData: BurnStatistics[]
}

export interface StatisticsResponse {
  code: number
  data: BurnStatistics[]
  message: string
}

export interface DashboardResponse {
  code: number
  data: DashboardStats
  message: string
}

export const dashboardApi = {
  // 获取烧录统计数据
  getStatistics: (days?: number): Promise<StatisticsResponse> => {
    return http.get('admin/statistics', {
      params: { days },
    })
  },

  // 获取 Dashboard 数据
  getDashboardStats: (): Promise<DashboardResponse> => {
    return http.get('admin/dashboard')
  },
}
