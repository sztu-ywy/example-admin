<template>
  <div class="student-view">
    <div class="page-header">
      <h2>学生住宿管理</h2>
      <a-space>
        <a-button type="primary" @click="showAssignModal">
          <template #icon>
            <PlusOutlined />
          </template>
          分配宿舍
        </a-button>
        <a-button @click="showAutoAssignModal">
          <template #icon>
            <ThunderboltOutlined />
          </template>
          自动分配
        </a-button>
        <a-button @click="showUnassignedStudents">
          <template #icon>
            <UserOutlined />
          </template>
          未分配学生
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="学生姓名">
          <a-input v-model:value="searchForm.name" placeholder="请输入学生姓名" />
        </a-form-item>
        <a-form-item label="学号">
          <a-input v-model:value="searchForm.student_no" placeholder="请输入学号" />
        </a-form-item>
        <a-form-item label="楼栋">
          <a-select v-model:value="searchForm.building_id" placeholder="请选择楼栋" style="width: 150px">
            <a-select-option value="">全部楼栋</a-select-option>
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="住宿状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" style="width: 120px">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="LIVING">在住</a-select-option>
            <a-select-option value="CHECKED_OUT">已退宿</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'gender'">
          <a-tag :color="record.user.gender === 'M' ? 'blue' : 'pink'">
            {{ record.user.gender === 'M' ? '男' : '女' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'LIVING' ? 'green' : 'red'">
            {{ record.status === 'LIVING' ? '在住' : '已退宿' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'roomInfo'">
          <span v-if="record.bed && record.bed.room && record.bed.room.building">
            {{ record.bed.room.building.name }} - {{ record.bed.room.room_number }} - {{ record.bed.bed_code }}号床
          </span>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button 
              v-if="record.status === 'LIVING'" 
              type="link" 
              size="small" 
              @click="handleCheckOut(record)"
            >
              退宿
            </a-button>
            <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这条住宿记录吗？"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 分配宿舍模态框 -->
    <a-modal
      v-model:open="assignModalVisible"
      title="分配宿舍"
      @ok="handleAssignSubmit"
      @cancel="handleAssignCancel"
      width="600px"
    >
      <a-form
        ref="assignFormRef"
        :model="assignFormData"
        :rules="assignFormRules"
        layout="vertical"
      >
        <a-form-item label="学生" name="user_id">
          <a-select
            v-model:value="assignFormData.user_id"
            placeholder="请选择学生"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option v-for="student in unassignedStudents" :key="student.id" :value="student.id">
              {{ student.name }}{{ student.student_no ? ` (${student.student_no})` : '' }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="楼栋" name="building_id">
          <a-select
            v-model:value="assignFormData.building_id"
            placeholder="请选择楼栋"
            @change="onBuildingChange"
          >
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间" name="room_id">
          <a-select
            v-model:value="assignFormData.room_id"
            placeholder="请选择房间"
            @change="onRoomChange"
          >
            <a-select-option v-for="room in availableRooms" :key="room.id" :value="room.id">
              {{ room.room_number || '未知' }}号房间 ({{ room.current_count || 0 }}/{{ room.capacity || 0 }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="床位" name="bed_id">
          <a-select v-model:value="assignFormData.bed_id" placeholder="请选择床位">
            <a-select-option v-for="bed in availableBeds" :key="bed.id" :value="bed.id">
              {{ bed.bed_code }}号床
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 自动分配模态框 -->
    <a-modal
      v-model:open="autoAssignModalVisible"
      title="自动分配宿舍"
      @ok="handleAutoAssignSubmit"
      @cancel="handleAutoAssignCancel"
      width="600px"
    >
      <a-form
        ref="autoAssignFormRef"
        :model="autoAssignFormData"
        layout="vertical"
      >
        <a-form-item label="选择学生" name="student_ids">
          <a-select
            v-model:value="autoAssignFormData.student_ids"
            mode="multiple"
            placeholder="请选择要分配宿舍的学生"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option v-for="student in unassignedStudents" :key="student.id" :value="student.id">
              {{ student.name }}{{ student.student_no ? ` (${student.student_no})` : '' }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="偏好设置">
          <a-form-item label="楼栋偏好" name="building_id">
            <a-select v-model:value="autoAssignFormData.preferences.building_id" placeholder="可选择偏好楼栋">
              <a-select-option value="">无偏好</a-select-option>
              <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="房间类型偏好" name="room_type">
            <a-select v-model:value="autoAssignFormData.preferences.room_type" placeholder="可选择房间类型">
              <a-select-option value="">无偏好</a-select-option>
              <a-select-option value="STANDARD">标准间</a-select-option>
              <a-select-option value="SUITE">套间</a-select-option>
            </a-select>
          </a-form-item>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 未分配学生模态框 -->
    <a-modal
      v-model:open="unassignedModalVisible"
      title="未分配宿舍的学生"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="unassignedColumns"
        :data-source="unassignedStudents"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'gender'">
            <a-tag :color="record.gender === 'M' ? 'blue' : 'pink'">
              {{ record.gender === 'M' ? '男' : '女' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="quickAssign(record)">
              快速分配
            </a-button>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import { studentApi, buildingApi, roomApi, userApi } from '~/api/dormitory'

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const buildings = ref([])
const unassignedStudents = ref([])
const availableRooms = ref([])
const availableBeds = ref([])
const assignModalVisible = ref(false)
const autoAssignModalVisible = ref(false)
const unassignedModalVisible = ref(false)
const assignFormRef = ref<FormInstance>()
const autoAssignFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  name: '',
  student_no: '',
  building_id: '',
  status: '',
})

// 分配表单数据
const assignFormData = reactive({
  user_id: '',
  building_id: '',
  room_id: '',
  bed_id: '',
})

// 自动分配表单数据
const autoAssignFormData = reactive({
  student_ids: [],
  preferences: {
    building_id: '',
    room_type: '',
  },
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
})

// 表格列配置
const columns: TableColumnsType = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '姓名',
    dataIndex: ['user', 'name'],
    key: 'name',
    width: 100,
  },
  {
    title: '学号',
    dataIndex: ['user', 'student_no'],
    key: 'student_no',
    width: 120,
  },
  {
    title: '性别',
    dataIndex: ['user', 'gender'],
    key: 'gender',
    width: 80,
  },
  {
    title: '住宿信息',
    key: 'roomInfo',
    width: 200,
  },
  {
    title: '入住时间',
    dataIndex: 'checkInDate',
    key: 'checkInDate',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
  },
]

// 未分配学生表格列
const unassignedColumns: TableColumnsType = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '学号',
    dataIndex: 'student_no',
    key: 'student_no',
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
  },
]

// 表单验证规则
const assignFormRules = {
  user_id: [
    { required: true, message: '请选择学生', trigger: 'change' },
  ],
  building_id: [
    { required: true, message: '请选择楼栋', trigger: 'change' },
  ],
  room_id: [
    { required: true, message: '请选择房间', trigger: 'change' },
  ],
  bed_id: [
    { required: true, message: '请选择床位', trigger: 'change' },
  ],
}

// 方法
const filterOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const fetchBuildings = async () => {
  try {
    const response = await buildingApi.getList()
    buildings.value = response.data || []
  } catch (error) {
    console.error('获取楼栋列表失败:', error)
    message.error('获取楼栋列表失败')
    // 使用模拟数据作为后备
    buildings.value = [
      { id: 1, name: '1号楼' },
      { id: 2, name: '2号楼' },
      { id: 3, name: '3号楼' },
    ]
  }
}

const fetchUnassignedStudents = async () => {
  try {
    const response = await studentApi.getUnassigned()
    console.log('未分配学生API响应:', response)
    unassignedStudents.value = response.data || []
    console.log('未分配学生数据:', unassignedStudents.value)
  } catch (error) {
    console.error('获取未分配学生列表失败:', error)
    message.error('获取未分配学生列表失败')
    unassignedStudents.value = []
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      ...searchForm,
    }
    const response = await studentApi.getList(params)
    dataSource.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取数据失败:', error)
    message.error('获取数据失败')
    dataSource.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    student_no: '',
    building_id: '',
    status: '',
  })
  handleSearch()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const showAssignModal = () => {
  resetAssignForm()
  assignModalVisible.value = true
}

const showAutoAssignModal = () => {
  resetAutoAssignForm()
  autoAssignModalVisible.value = true
}

const showUnassignedStudents = () => {
  fetchUnassignedStudents()
  unassignedModalVisible.value = true
}

const resetAssignForm = () => {
  Object.assign(assignFormData, {
    user_id: '',
    building_id: '',
    room_id: '',
    bed_id: '',
  })
  availableRooms.value = []
  availableBeds.value = []
  assignFormRef.value?.resetFields()
}

const resetAutoAssignForm = () => {
  Object.assign(autoAssignFormData, {
    student_ids: [],
    preferences: {
      building_id: '',
      room_type: '',
    },
  })
  autoAssignFormRef.value?.resetFields()
}

const onBuildingChange = async (buildingId: string) => {
  assignFormData.room_id = ''
  assignFormData.bed_id = ''
  availableBeds.value = []

  if (buildingId) {
    try {
      const response = await roomApi.getList({ building_id: buildingId })
      console.log('房间API响应:', response)
      console.log('房间数据详情:', response.data)
      availableRooms.value = response.data || []
    } catch (error) {
      console.error('获取可用房间失败:', error)
      message.error('获取可用房间失败')
      availableRooms.value = []
    }
  } else {
    availableRooms.value = []
  }
}

const onRoomChange = async (roomId: string) => {
  assignFormData.bed_id = ''

  if (roomId) {
    try {
      console.log('获取房间床位，房间ID:', roomId)

      // 方法1：使用房间床位API
      const response = await roomApi.getBeds(Number(roomId))
      console.log('床位API响应:', response)

      // 过滤出空闲的床位
      const freeBeds = (response.data || []).filter(bed => bed.status === 0) // 0 = BedStatusFree
      availableBeds.value = freeBeds

      console.log('可用床位:', availableBeds.value)

      if (availableBeds.value.length === 0) {
        message.warning('该房间暂无可用床位')
      } else {
        message.success(`找到 ${availableBeds.value.length} 个可用床位`)
      }
    } catch (error) {
      console.error('获取可用床位失败:', error)
      message.error('获取可用床位失败')
      availableBeds.value = []
    }
  } else {
    availableBeds.value = []
  }
}

const handleAssignSubmit = async () => {
  try {
    await assignFormRef.value?.validate()

    const assignData = {
      user_id: assignFormData.user_id,
      bed_id: assignFormData.bed_id,
      check_in_date: new Date().toISOString().split('T')[0], // 今天的日期
    }

    await studentApi.assign(assignData)
    message.success('分配成功')
    assignModalVisible.value = false
    fetchData()
    fetchUnassignedStudents()
  } catch (error) {
    console.error('分配宿舍失败:', error)
    message.error('分配宿舍失败')
  }
}

const handleAssignCancel = () => {
  assignModalVisible.value = false
  resetAssignForm()
}

const handleAutoAssignSubmit = async () => {
  try {
    if (autoAssignFormData.studentIds.length === 0) {
      message.warning('请选择要分配的学生')
      return
    }

    const assignData = {
      student_ids: autoAssignFormData.student_ids,
      preferences: autoAssignFormData.preferences,
    }

    await studentApi.autoAssign(assignData)
    message.success('自动分配成功')
    autoAssignModalVisible.value = false
    fetchData()
    fetchUnassignedStudents()
  } catch (error) {
    console.error('自动分配失败:', error)
    message.error('自动分配失败')
  }
}

const handleAutoAssignCancel = () => {
  autoAssignModalVisible.value = false
  resetAutoAssignForm()
}

const handleCheckOut = async (record: any) => {
  try {
    await studentApi.checkOut(record.id)
    message.success('退宿成功')
    fetchData()
  } catch (error) {
    console.error('退宿失败:', error)
    message.error('退宿失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await studentApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const quickAssign = (student: any) => {
  assignFormData.user_id = student.id
  assignModalVisible.value = true
  unassignedModalVisible.value = false
}

const showEditModal = (record: any) => {
  // TODO: 实现编辑功能
  message.info('编辑功能待实现')
}

// 生命周期
onMounted(() => {
  fetchBuildings()
  fetchUnassignedStudents()
  fetchData()
})
</script>

<style scoped>
.student-view {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-area {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

html.dark .search-area {
  background: #262626;
}
</style>
