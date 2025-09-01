<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>宿舍管理系统</h1>
      <p>欢迎使用宿舍管理系统，这里是系统概览</p>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic
            title="总楼栋数"
            :value="statistics.totalBuildings"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <BankOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic
            title="总房间数"
            :value="statistics.totalRooms"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <AppstoreOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic
            title="在住学生"
            :value="statistics.totalStudents"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card>
          <a-statistic
            title="入住率"
            :value="statistics.occupancyRate"
            suffix="%"
            :precision="1"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix>
              <PieChartOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="charts-section">
      <a-col :xs="24" :lg="12">
        <a-card title="楼栋入住情况" class="chart-card">
          <div ref="buildingChartRef" style="height: 300px;"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="维修工单状态分布" class="chart-card">
          <div ref="repairChartRef" style="height: 300px;"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作和待处理事项 -->
    <a-row :gutter="16" class="action-section">
      <a-col :xs="24" :lg="12">
        <a-card title="快捷操作" class="action-card">
          <a-space direction="vertical" style="width: 100%;">
            <a-button type="primary" block @click="goToPage('/buildings')">
              <template #icon>
                <BankOutlined />
              </template>
              楼栋管理
            </a-button>
            <a-button block @click="goToPage('/students')">
              <template #icon>
                <TeamOutlined />
              </template>
              学生住宿
            </a-button>
            <a-button block @click="goToPage('/repairs')">
              <template #icon>
                <ToolOutlined />
              </template>
              维修工单
            </a-button>
            <a-button block @click="goToPage('/visits')">
              <template #icon>
                <ContactsOutlined />
              </template>
              访客管理
            </a-button>
          </a-space>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="待处理事项" class="pending-card">
          <a-list
            :data-source="pendingItems"
            :loading="pendingLoading"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a @click="handlePendingItem(item)">{{ item.title }}</a>
                  </template>
                  <template #description>
                    <a-tag :color="item.color" size="small">{{ item.type }}</a-tag>
                    {{ item.description }}
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <span style="color: #999; font-size: 12px;">{{ item.time }}</span>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import {
  BankOutlined,
  AppstoreOutlined,
  TeamOutlined,
  PieChartOutlined,
  ToolOutlined,
  ContactsOutlined,
} from '@ant-design/icons-vue'
import { statisticsApi } from '~/api/dormitory'
import { useSettingsStore } from '~/store'

const router = useRouter()
const settingsStore = useSettingsStore()

// 响应式数据
const statistics = reactive({
  totalBuildings: 0,
  totalRooms: 0,
  totalStudents: 0,
  occupancyRate: 0,
})

const pendingItems = ref([])
const pendingLoading = ref(false)
const buildingChartRef = ref()
const repairChartRef = ref()
let buildingChart: echarts.ECharts | null = null
let repairChart: echarts.ECharts | null = null

// 方法
const goToPage = (path: string) => {
  router.push(path)
}

const handlePendingItem = (item: any) => {
  router.push(item.path)
}

const fetchStatistics = async () => {
  try {
    // TODO: 调用API获取统计数据
    // const response = await statisticsApi.getDashboard()
    // Object.assign(statistics, response.data)

    // 模拟数据
    Object.assign(statistics, {
      totalBuildings: 8,
      totalRooms: 320,
      totalStudents: 1280,
      occupancyRate: 85.5,
    })
  } catch (error) {
    message.error('获取统计数据失败')
  }
}

const fetchPendingItems = async () => {
  pendingLoading.value = true
  try {
    // TODO: 调用API获取待处理事项
    // 模拟数据
    pendingItems.value = [
      {
        id: 1,
        title: '待审核访客申请',
        description: '张父申请访问张三',
        type: '访客管理',
        color: 'orange',
        time: '2小时前',
        path: '/visits',
      },
      {
        id: 2,
        title: '待处理维修工单',
        description: '1号楼101房间水龙头漏水',
        type: '维修工单',
        color: 'red',
        time: '3小时前',
        path: '/repairs',
      },
      {
        id: 3,
        title: '未分配学生',
        description: '5名学生尚未分配宿舍',
        type: '学生住宿',
        color: 'blue',
        time: '1天前',
        path: '/students',
      },
    ]
  } catch (error) {
    message.error('获取待处理事项失败')
  } finally {
    pendingLoading.value = false
  }
}

const initBuildingChart = () => {
  if (!buildingChartRef.value) return

  // 检测当前是否为黑暗模式
  const isDark = document.documentElement.classList.contains('dark')

  buildingChart = echarts.init(buildingChartRef.value, isDark ? 'dark' : 'light')

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: isDark ? '#262626' : '#fff',
      borderColor: isDark ? '#303030' : '#d9d9d9',
      textStyle: {
        color: isDark ? '#fff' : '#000'
      }
    },
    legend: {
      data: ['总床位', '已入住', '空闲'],
      textStyle: {
        color: isDark ? '#fff' : '#000'
      }
    },
    xAxis: {
      type: 'category',
      data: ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼'],
      axisLabel: {
        color: isDark ? '#ccc' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d9d9d9'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: isDark ? '#ccc' : '#666'
      },
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d9d9d9'
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#f0f0f0'
        }
      }
    },
    series: [
      {
        name: '总床位',
        type: 'bar',
        data: [240, 240, 200, 200, 160],
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '已入住',
        type: 'bar',
        data: [210, 220, 180, 170, 140],
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '空闲',
        type: 'bar',
        data: [30, 20, 20, 30, 20],
        itemStyle: { color: '#fac858' }
      }
    ]
  }

  buildingChart.setOption(option)
}

const initRepairChart = () => {
  if (!repairChartRef.value) return

  // 检测当前是否为黑暗模式
  const isDark = document.documentElement.classList.contains('dark')

  repairChart = echarts.init(repairChartRef.value, isDark ? 'dark' : 'light')

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#262626' : '#fff',
      borderColor: isDark ? '#303030' : '#d9d9d9',
      textStyle: {
        color: isDark ? '#fff' : '#000'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: isDark ? '#fff' : '#000'
      }
    },
    series: [
      {
        name: '工单状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 15, name: '待处理', itemStyle: { color: '#ff7875' } },
          { value: 25, name: '处理中', itemStyle: { color: '#40a9ff' } },
          { value: 60, name: '已完成', itemStyle: { color: '#73d13d' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  repairChart.setOption(option)
}

const handleResize = () => {
  buildingChart?.resize()
  repairChart?.resize()
}

// 主题切换时重新初始化图表
const handleThemeChange = () => {
  if (buildingChart) {
    buildingChart.dispose()
    buildingChart = null
  }
  if (repairChart) {
    repairChart.dispose()
    repairChart = null
  }

  nextTick(() => {
    initBuildingChart()
    initRepairChart()
  })
}

// 监听主题变化
watch(() => settingsStore.isDark, () => {
  handleThemeChange()
})

// 生命周期
onMounted(async () => {
  await fetchStatistics()
  await fetchPendingItems()

  await nextTick()
  initBuildingChart()
  initRepairChart()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  buildingChart?.dispose()
  repairChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

html.dark .dashboard {
  background: #141414;
}

.dashboard-header {
  margin-bottom: 24px;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #1890ff;
  margin-bottom: 8px;
}

html.dark .dashboard-header h1 {
  color: #40a9ff;
}

.dashboard-header p {
  color: #666;
  font-size: 16px;
}

html.dark .dashboard-header p {
  color: #ccc;
}

.stats-cards {
  margin-bottom: 24px;
}

.stats-cards .ant-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

html.dark .stats-cards .ant-card {
  background: #1f1f1f;
  border-color: #303030;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

html.dark .chart-card {
  background: #1f1f1f;
  border-color: #303030;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.action-section {
  margin-bottom: 24px;
}

.action-card,
.pending-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

html.dark .action-card,
html.dark .pending-card {
  background: #1f1f1f !important;
  border-color: #303030;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark .action-card .ant-card-head,
html.dark .pending-card .ant-card-head {
  background: #1f1f1f !important;
  border-color: #303030;
}

html.dark .action-card .ant-card-body,
html.dark .pending-card .ant-card-body {
  background: #1f1f1f !important;
}

html.dark .action-card .ant-card-head-title,
html.dark .pending-card .ant-card-head-title {
  color: #fff !important;
}

.action-card .ant-btn {
  height: 48px;
  font-size: 16px;
}

.pending-card .ant-list-item {
  padding: 12px 0;
}

.pending-card .ant-list-item-meta-title a {
  color: #1890ff;
  text-decoration: none;
}

.pending-card .ant-list-item-meta-title a:hover {
  color: #40a9ff;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .dashboard-header p {
    font-size: 14px;
  }

  .stats-cards {
    margin-bottom: 16px;
  }

  .charts-section,
  .action-section {
    margin-bottom: 16px;
  }
}
</style>