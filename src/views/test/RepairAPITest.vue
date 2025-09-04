<template>
  <div class="repair-api-test">
    <a-card title="维修工单API测试" style="margin-bottom: 16px;">
      <a-space>
        <a-button type="primary" @click="testCurrentUser" :loading="loading.user">
          测试用户信息
        </a-button>
        <a-button @click="testGetBuildings" :loading="loading.buildings">
          测试楼栋列表
        </a-button>
        <a-button @click="testGetRooms" :loading="loading.rooms">
          测试房间列表
        </a-button>
        <a-button @click="testGetRepairs" :loading="loading.repairs">
          测试工单列表
        </a-button>
        <a-button type="primary" @click="testCreateRepair" :loading="loading.create">
          测试创建工单
        </a-button>
        <a-button danger @click="clearResults">
          清空结果
        </a-button>
      </a-space>
    </a-card>

    <a-card title="测试结果" v-if="results.length > 0">
      <div v-for="(result, index) in results" :key="index" class="test-result">
        <a-alert
          :type="result.success ? 'success' : 'error'"
          :message="result.title"
          :description="result.description"
          show-icon
          style="margin-bottom: 8px;"
        />
        <a-collapse v-if="result.data" style="margin-bottom: 16px;">
          <a-collapse-panel key="1" header="详细数据">
            <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-card>

    <!-- 创建工单表单 -->
    <a-modal
      v-model:open="modalVisible"
      title="创建测试工单"
      @ok="handleCreateSubmit"
      :confirm-loading="loading.create"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="工单标题" required>
          <a-input v-model:value="formData.title" placeholder="请输入工单标题" />
        </a-form-item>
        <a-form-item label="问题描述" required>
          <a-textarea v-model:value="formData.description" placeholder="请描述具体问题" :rows="3" />
        </a-form-item>
        <a-form-item label="优先级" required>
          <a-select v-model:value="formData.priority" placeholder="请选择优先级">
            <a-select-option value="LOW">低</a-select-option>
            <a-select-option value="MEDIUM">中</a-select-option>
            <a-select-option value="HIGH">高</a-select-option>
            <a-select-option value="URGENT">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="楼栋" required>
          <a-select v-model:value="formData.buildingId" placeholder="请选择楼栋" @change="onBuildingChange">
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间" required>
          <a-select v-model:value="formData.roomId" placeholder="请选择房间">
            <a-select-option v-for="room in availableRooms" :key="room.id" :value="room.id">
              {{ room.roomNumber }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="学生ID" v-if="isAdmin">
          <a-input-number v-model:value="formData.studentId" placeholder="管理员需要指定学生ID" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { repairApi, buildingApi, roomApi, userApi } from '~/api/dormitory'
import { useUserStore } from '~/store'

const userStore = useUserStore()

// 响应式数据
const results = ref([])
const buildings = ref([])
const availableRooms = ref([])
const modalVisible = ref(false)

const loading = reactive({
  user: false,
  buildings: false,
  rooms: false,
  repairs: false,
  create: false,
})

const formData = reactive({
  title: '',
  description: '',
  priority: 'MEDIUM',
  buildingId: '',
  roomId: '',
  studentId: null,
})

// 计算属性
const isAdmin = computed(() => {
  return userStore.user?.role === 'ADMIN' || userStore.user?.role === 'DORM_MANAGER'
})

// 添加测试结果
const addResult = (title: string, success: boolean, description: string, data?: any) => {
  results.value.unshift({
    title,
    success,
    description,
    data,
    timestamp: new Date().toLocaleString(),
  })
}

// 测试当前用户信息
const testCurrentUser = async () => {
  loading.user = true
  try {
    const response = await userApi.getCurrentUser()
    addResult(
      '获取用户信息',
      true,
      `成功获取用户信息：${response.data.name} (${response.data.role})`,
      response.data
    )
  } catch (error) {
    addResult(
      '获取用户信息',
      false,
      `获取用户信息失败：${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.user = false
  }
}

// 测试楼栋列表
const testGetBuildings = async () => {
  loading.buildings = true
  try {
    const response = await buildingApi.getList()
    buildings.value = response.data || []
    addResult(
      '获取楼栋列表',
      true,
      `成功获取 ${buildings.value.length} 个楼栋`,
      response.data
    )
  } catch (error) {
    addResult(
      '获取楼栋列表',
      false,
      `获取楼栋列表失败：${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.buildings = false
  }
}

// 测试房间列表
const testGetRooms = async () => {
  loading.rooms = true
  try {
    const response = await roomApi.getList({ building_id: 1 })
    addResult(
      '获取房间列表',
      true,
      `成功获取 ${response.data?.length || 0} 个房间`,
      response.data
    )
  } catch (error) {
    addResult(
      '获取房间列表',
      false,
      `获取房间列表失败：${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.rooms = false
  }
}

// 测试工单列表
const testGetRepairs = async () => {
  loading.repairs = true
  try {
    const response = await repairApi.getList()
    addResult(
      '获取工单列表',
      true,
      `成功获取 ${response.data?.length || 0} 个工单`,
      response.data
    )
  } catch (error) {
    addResult(
      '获取工单列表',
      false,
      `获取工单列表失败：${error.response?.data?.message || error.message}`,
      error.response?.data
    )
  } finally {
    loading.repairs = false
  }
}

// 测试创建工单
const testCreateRepair = () => {
  // 重置表单
  Object.assign(formData, {
    title: `测试工单 - ${new Date().toLocaleString()}`,
    description: '这是一个API测试工单，用于验证前后端接口是否正常工作。',
    priority: 'MEDIUM',
    buildingId: '',
    roomId: '',
    studentId: isAdmin.value ? 1 : null,
  })
  
  modalVisible.value = true
}

// 楼栋变化时获取房间
const onBuildingChange = async (buildingId: string) => {
  formData.roomId = ''
  
  if (buildingId) {
    try {
      const response = await roomApi.getList({ building_id: buildingId })
      availableRooms.value = response.data || []
    } catch (error) {
      message.error('获取房间列表失败')
    }
  } else {
    availableRooms.value = []
  }
}

// 提交创建工单
const handleCreateSubmit = async () => {
  if (!formData.title || !formData.description || !formData.roomId) {
    message.error('请填写完整信息')
    return
  }

  loading.create = true
  try {
    const submitData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      room_id: formData.roomId,
    }

    // 如果是管理员，添加学生ID
    if (isAdmin.value && formData.studentId) {
      submitData.student_id = formData.studentId
    }

    const response = await repairApi.create(submitData)
    addResult(
      '创建工单',
      true,
      `成功创建工单：${response.data.title}`,
      response.data
    )
    modalVisible.value = false
    message.success('工单创建成功')
  } catch (error) {
    addResult(
      '创建工单',
      false,
      `创建工单失败：${error.response?.data?.message || error.message}`,
      error.response?.data
    )
    message.error('工单创建失败')
  } finally {
    loading.create = false
  }
}

// 清空结果
const clearResults = () => {
  results.value = []
}
</script>

<style scoped>
.repair-api-test {
  padding: 16px;
}

.test-result {
  margin-bottom: 16px;
}

pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
