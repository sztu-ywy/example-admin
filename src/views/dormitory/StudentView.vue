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
          <a-input v-model:value="searchForm.studentNo" placeholder="请输入学号" />
        </a-form-item>
        <a-form-item label="楼栋">
          <a-select v-model:value="searchForm.buildingId" placeholder="请选择楼栋" style="width: 150px">
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
          <span v-if="record.bed">
            {{ record.bed.room.building.name }} - {{ record.bed.room.roomNumber }} - {{ record.bed.bedCode }}号床
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
        <a-form-item label="学生" name="userId">
          <a-select
            v-model:value="assignFormData.userId"
            placeholder="请选择学生"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option v-for="student in unassignedStudents" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.studentNo }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="楼栋" name="buildingId">
          <a-select 
            v-model:value="assignFormData.buildingId" 
            placeholder="请选择楼栋"
            @change="onBuildingChange"
          >
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间" name="roomId">
          <a-select 
            v-model:value="assignFormData.roomId" 
            placeholder="请选择房间"
            @change="onRoomChange"
          >
            <a-select-option v-for="room in availableRooms" :key="room.id" :value="room.id">
              {{ room.roomNumber }} ({{ room.currentCount }}/{{ room.capacity }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="床位" name="bedId">
          <a-select v-model:value="assignFormData.bedId" placeholder="请选择床位">
            <a-select-option v-for="bed in availableBeds" :key="bed.id" :value="bed.id">
              {{ bed.bedCode }}号床
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
        <a-form-item label="选择学生" name="studentIds">
          <a-select
            v-model:value="autoAssignFormData.studentIds"
            mode="multiple"
            placeholder="请选择要分配宿舍的学生"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option v-for="student in unassignedStudents" :key="student.id" :value="student.id">
              {{ student.name }} ({{ student.studentNo }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="偏好设置">
          <a-form-item label="楼栋偏好" name="buildingId">
            <a-select v-model:value="autoAssignFormData.preferences.buildingId" placeholder="可选择偏好楼栋">
              <a-select-option value="">无偏好</a-select-option>
              <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="房间类型偏好" name="roomType">
            <a-select v-model:value="autoAssignFormData.preferences.roomType" placeholder="可选择房间类型">
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
  studentNo: '',
  buildingId: '',
  status: '',
})

// 分配表单数据
const assignFormData = reactive({
  userId: '',
  buildingId: '',
  roomId: '',
  bedId: '',
})

// 自动分配表单数据
const autoAssignFormData = reactive({
  studentIds: [],
  preferences: {
    buildingId: '',
    roomType: '',
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
    dataIndex: ['user', 'studentNo'],
    key: 'studentNo',
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
    dataIndex: 'studentNo',
    key: 'studentNo',
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
  userId: [
    { required: true, message: '请选择学生', trigger: 'change' },
  ],
  buildingId: [
    { required: true, message: '请选择楼栋', trigger: 'change' },
  ],
  roomId: [
    { required: true, message: '请选择房间', trigger: 'change' },
  ],
  bedId: [
    { required: true, message: '请选择床位', trigger: 'change' },
  ],
}

// 方法
const filterOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const fetchBuildings = async () => {
  try {
    // TODO: 调用API获取楼栋列表
    buildings.value = [
      { id: 1, name: '1号楼' },
      { id: 2, name: '2号楼' },
      { id: 3, name: '3号楼' },
    ]
  } catch (error) {
    message.error('获取楼栋列表失败')
  }
}

const fetchUnassignedStudents = async () => {
  try {
    // TODO: 调用API获取未分配学生列表
    unassignedStudents.value = [
      {
        id: 1,
        name: '李四',
        studentNo: '2021002',
        gender: 'M',
        phone: '13800138000',
      },
      {
        id: 2,
        name: '王五',
        studentNo: '2021003',
        gender: 'F',
        phone: '13800138001',
      },
    ]
  } catch (error) {
    message.error('获取未分配学生列表失败')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取数据
    // 模拟数据
    dataSource.value = [
      {
        id: 1,
        user: {
          name: '张三',
          studentNo: '2021001',
          gender: 'M',
        },
        bed: {
          bedCode: '1',
          room: {
            roomNumber: '101',
            building: {
              name: '1号楼',
            },
          },
        },
        checkInDate: '2024-01-01',
        status: 'LIVING',
      },
    ]
    pagination.total = 1
  } catch (error) {
    message.error('获取数据失败')
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
    studentNo: '',
    buildingId: '',
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
    userId: '',
    buildingId: '',
    roomId: '',
    bedId: '',
  })
  availableRooms.value = []
  availableBeds.value = []
  assignFormRef.value?.resetFields()
}

const resetAutoAssignForm = () => {
  Object.assign(autoAssignFormData, {
    studentIds: [],
    preferences: {
      buildingId: '',
      roomType: '',
    },
  })
  autoAssignFormRef.value?.resetFields()
}

const onBuildingChange = async (buildingId: string) => {
  assignFormData.roomId = ''
  assignFormData.bedId = ''
  availableBeds.value = []
  
  if (buildingId) {
    try {
      // TODO: 调用API获取可用房间
      availableRooms.value = [
        { id: 1, roomNumber: '101', currentCount: 2, capacity: 4 },
        { id: 2, roomNumber: '102', currentCount: 1, capacity: 4 },
      ]
    } catch (error) {
      message.error('获取可用房间失败')
    }
  } else {
    availableRooms.value = []
  }
}

const onRoomChange = async (roomId: string) => {
  assignFormData.bedId = ''
  
  if (roomId) {
    try {
      // TODO: 调用API获取可用床位
      availableBeds.value = [
        { id: 1, bedCode: '1' },
        { id: 2, bedCode: '2' },
      ]
    } catch (error) {
      message.error('获取可用床位失败')
    }
  } else {
    availableBeds.value = []
  }
}

const handleAssignSubmit = async () => {
  try {
    await assignFormRef.value?.validate()
    
    // TODO: 调用API分配宿舍
    message.success('分配成功')
    assignModalVisible.value = false
    fetchData()
    fetchUnassignedStudents()
  } catch (error) {
    console.error('表单验证失败:', error)
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
    
    // TODO: 调用API自动分配宿舍
    message.success('自动分配成功')
    autoAssignModalVisible.value = false
    fetchData()
    fetchUnassignedStudents()
  } catch (error) {
    message.error('自动分配失败')
  }
}

const handleAutoAssignCancel = () => {
  autoAssignModalVisible.value = false
  resetAutoAssignForm()
}

const handleCheckOut = async (record: any) => {
  try {
    // TODO: 调用API退宿
    message.success('退宿成功')
    fetchData()
  } catch (error) {
    message.error('退宿失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    // TODO: 调用API删除数据
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const quickAssign = (student: any) => {
  assignFormData.userId = student.id
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
