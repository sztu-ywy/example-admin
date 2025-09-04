<template>
  <div class="repair-view">
    <div class="page-header">
      <h2>维修工单管理</h2>
      <a-space>
        <a-button type="primary" @click="showCreateModal">
          <template #icon>
            <PlusOutlined />
          </template>
          新建工单
        </a-button>
        <a-button @click="showPendingRepairs">
          <template #icon>
            <ClockCircleOutlined />
          </template>
          待处理工单
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="工单标题">
          <a-input v-model:value="searchForm.title" placeholder="请输入工单标题" />
        </a-form-item>
        <a-form-item label="学生姓名">
          <a-input v-model:value="searchForm.studentName" placeholder="请输入学生姓名" />
        </a-form-item>
        <a-form-item label="楼栋">
          <a-select v-model:value="searchForm.buildingId" placeholder="请选择楼栋" style="width: 150px">
            <a-select-option value="">全部楼栋</a-select-option>
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="工单状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" style="width: 120px">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="PENDING">待处理</a-select-option>
            <a-select-option value="PROCESSING">处理中</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
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
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'priority'">
          <a-tag :color="getPriorityColor(record.priority)">
            {{ getPriorityText(record.priority) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'roomInfo'">
          <span v-if="record.room">
            {{ record.room.building.name }} - {{ record.room.room_number }}
          </span>
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
            <a-button 
              v-if="record.status === 'PENDING'" 
              type="link" 
              size="small" 
              @click="showAssignModal(record)"
            >
              分配
            </a-button>
            <a-button 
              v-if="record.status !== 'COMPLETED'" 
              type="link" 
              size="small" 
              @click="showStatusModal(record)"
            >
              更新状态
            </a-button>
            <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个工单吗？"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="工单标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入工单标题" />
        </a-form-item>
        <a-form-item label="问题描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请详细描述问题"
            :rows="4"
          />
        </a-form-item>
        <a-form-item label="报修学生" name="student_id">
          <a-select
            v-model:value="formData.student_id"
            placeholder="请选择报修学生"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }}{{ student.student_no ? ` (${student.student_no})` : '' }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="formData.priority" placeholder="请选择优先级">
            <a-select-option value="LOW">低</a-select-option>
            <a-select-option value="MEDIUM">中</a-select-option>
            <a-select-option value="HIGH">高</a-select-option>
            <a-select-option value="URGENT">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="楼栋" name="building_id">
          <a-select
            v-model:value="formData.building_id"
            placeholder="请选择楼栋"
            @change="onBuildingChange"
          >
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间" name="room_id">
          <a-select v-model:value="formData.room_id" placeholder="请选择房间">
            <a-select-option v-for="room in availableRooms" :key="room.id" :value="room.id">
              {{ room.room_number || '未知' }}号房间 ({{ getTypeText(room.type || 'STANDARD') }})
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配维修人员模态框 -->
    <a-modal
      v-model:open="assignModalVisible"
      title="分配维修人员"
      @ok="handleAssignSubmit"
      @cancel="handleAssignCancel"
    >
      <a-form
        ref="assignFormRef"
        :model="assignFormData"
        :rules="assignFormRules"
        layout="vertical"
      >
        <a-form-item label="维修人员" name="staff_id">
          <a-select v-model:value="assignFormData.staff_id" placeholder="请选择维修人员">
            <a-select-option v-for="staff in repairStaff" :key="staff.id" :value="staff.id">
              {{ staff.name }} ({{ staff.phone }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea
            v-model:value="assignFormData.remark"
            placeholder="分配说明或备注"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 更新状态模态框 -->
    <a-modal
      v-model:open="statusModalVisible"
      title="更新工单状态"
      @ok="handleStatusSubmit"
      @cancel="handleStatusCancel"
    >
      <a-form
        ref="statusFormRef"
        :model="statusFormData"
        :rules="statusFormRules"
        layout="vertical"
      >
        <a-form-item label="状态" name="status">
          <a-select v-model:value="statusFormData.status" placeholder="请选择状态">
            <a-select-option value="PROCESSING">处理中</a-select-option>
            <a-select-option value="COMPLETED">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理说明" name="remark">
          <a-textarea
            v-model:value="statusFormData.remark"
            placeholder="请输入处理说明"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 工单详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="工单详情"
      :footer="null"
      width="800px"
    >
      <div v-if="currentRepair" class="repair-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="工单编号">{{ currentRepair.id }}</a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentRepair.status)">
              {{ getStatusText(currentRepair.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="标题">{{ currentRepair.title }}</a-descriptions-item>
          <a-descriptions-item label="优先级">
            <a-tag :color="getPriorityColor(currentRepair.priority)">
              {{ getPriorityText(currentRepair.priority) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="提交人">{{ currentRepair.student?.user?.name }}</a-descriptions-item>
          <a-descriptions-item label="房间">
            {{ currentRepair.room?.building?.name }} - {{ currentRepair.room?.room_number }}
          </a-descriptions-item>
          <a-descriptions-item label="维修人员">
            {{ currentRepair.assignTo?.name || '未分配' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ currentRepair.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="问题描述" :span="2">
            {{ currentRepair.description }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 工单留言 -->
        <div class="comments-section" style="margin-top: 24px;">
          <h4>工单留言</h4>
          <div class="comment-list">
            <div v-for="comment in repairComments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <strong>{{ comment.user.name }}</strong>
                <span class="comment-time">{{ comment.createdAt }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
            </div>
          </div>
          
          <!-- 添加留言 -->
          <div class="add-comment" style="margin-top: 16px;">
            <a-textarea
              v-model:value="newComment"
              placeholder="添加留言..."
              :rows="3"
              style="margin-bottom: 8px;"
            />
            <a-button type="primary" @click="addComment">添加留言</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import { repairApi, buildingApi, roomApi, userApi } from '~/api/dormitory'
import { useUserStore } from '~/store'

// 用户信息
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const buildings = ref([])
const availableRooms = ref([])
const students = ref([])
const repairStaff = ref([])
const repairComments = ref([])
const modalVisible = ref(false)
const assignModalVisible = ref(false)
const statusModalVisible = ref(false)
const detailModalVisible = ref(false)
const modalTitle = ref('新建工单')
const editingId = ref<number | null>(null)
const currentRepair = ref(null)
const newComment = ref('')
const formRef = ref<FormInstance>()
const assignFormRef = ref<FormInstance>()
const statusFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  title: '',
  studentName: '',
  buildingId: '',
  status: '',
})

// 表单数据
const formData = reactive({
  title: '',
  description: '',
  priority: 'MEDIUM',
  building_id: '',
  room_id: '',
  student_id: '', // 管理员创建工单时需要指定学生ID
})

// 分配表单数据
const assignFormData = reactive({
  staff_id: '',
  remark: '',
})

// 状态表单数据
const statusFormData = reactive({
  status: '',
  remark: '',
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
    title: '工单标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '提交人',
    dataIndex: ['student', 'user', 'name'],
    key: 'studentName',
    width: 100,
  },
  {
    title: '房间',
    key: 'roomInfo',
    width: 150,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '维修人员',
    dataIndex: ['assignTo', 'name'],
    key: 'assignToName',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 250,
  },
]

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
  room_id: [
    { required: true, message: '请选择房间', trigger: 'change' },
  ],
  student_id: [
    { required: true, message: '请选择报修学生', trigger: 'change' },
  ],
}

const assignFormRules = {
  staff_id: [
    { required: true, message: '请选择维修人员', trigger: 'change' },
  ],
}

const statusFormRules = {
  status: [
    { required: true, message: '请选择状态', trigger: 'change' },
  ],
  remark: [
    { required: true, message: '请输入处理说明', trigger: 'blur' },
  ],
}

// 方法
const getStatusColor = (status: string) => {
  const colors = {
    PENDING: 'orange',
    PROCESSING: 'blue',
    COMPLETED: 'green',
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    COMPLETED: '已完成',
  }
  return texts[status] || '未知'
}

const getPriorityColor = (priority: string) => {
  const colors = {
    LOW: 'green',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
  }
  return colors[priority] || 'default'
}

const filterOption = (input: string, option: any) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const getPriorityText = (priority: string) => {
  const texts = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    URGENT: '紧急',
  }
  return texts[priority] || '未知'
}

const getTypeText = (type: string) => {
  const types = {
    STANDARD: '标准间',
    SUITE: '套间',
  }
  return types[type] || '标准间'
}

const fetchBuildings = async () => {
  try {
    const response = await buildingApi.getList()
    buildings.value = response.data || []
  } catch (error) {
    console.error('获取楼栋列表失败:', error)
    message.error('获取楼栋列表失败')
    buildings.value = []
  }
}

const fetchStudents = async () => {
  try {
    const response = await userApi.getStudents()
    students.value = response.data || []
  } catch (error) {
    console.error('获取学生列表失败:', error)
    message.error('获取学生列表失败')
    students.value = []
  }
}

const fetchRepairStaff = async () => {
  try {
    const response = await userApi.getRepairStaff()
    repairStaff.value = response.data || []
  } catch (error) {
    console.error('获取维修人员列表失败:', error)
    message.error('获取维修人员列表失败')
    repairStaff.value = []
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
    const response = await repairApi.getList(params)
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
    title: '',
    studentName: '',
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

const showCreateModal = () => {
  modalTitle.value = '新建工单'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

const showEditModal = (record: any) => {
  modalTitle.value = '编辑工单'
  editingId.value = record.id
  Object.assign(formData, record)
  modalVisible.value = true
}

const showPendingRepairs = () => {
  searchForm.status = 'PENDING'
  handleSearch()
}

const resetForm = () => {
  Object.assign(formData, {
    title: '',
    description: '',
    priority: 'MEDIUM',
    building_id: '',
    room_id: '',
    student_id: '',
  })
  availableRooms.value = []
  formRef.value?.resetFields()
}

const onBuildingChange = async (buildingId: string) => {
  formData.room_id = ''

  if (buildingId) {
    try {
      console.log('正在获取楼栋房间列表，楼栋ID:', buildingId)

      // 方法1：使用通用列表接口
      console.log('尝试方法1: roomApi.getList({ building_id: buildingId })')
      const response = await roomApi.getList({ building_id: buildingId })
      console.log('方法1响应:', response)
      console.log('房间数据详情:', response.data)

      availableRooms.value = response.data || []

      // 如果没有数据，尝试使用专门的方法
      if (!availableRooms.value.length) {
        console.log('方法1无数据，尝试方法2: roomApi.getByBuilding(buildingId)')
        const response2 = await roomApi.getByBuilding(Number(buildingId))
        console.log('方法2响应:', response2)
        availableRooms.value = response2.data || []
      }

      console.log('最终获取到的房间列表:', availableRooms.value)

      if (availableRooms.value.length === 0) {
        message.warning(`楼栋 ${buildingId} 下暂无房间数据`)
      } else {
        message.success(`成功获取到 ${availableRooms.value.length} 个房间`)
      }
    } catch (error) {
      console.error('获取房间列表失败:', error)
      message.error('获取房间列表失败')
      availableRooms.value = []
    }
  } else {
    availableRooms.value = []
    console.log('清空房间列表')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    const submitData: any = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      room_id: formData.room_id, // 注意：后端使用snake_case
    }

    // 如果是创建工单，需要添加 student_id
    if (!editingId.value) {
      // 根据用户角色决定如何设置 student_id
      if (userStore.user?.role === 'STUDENT') {
        // 学生用户：使用自己的ID作为student_id
        submitData.student_id = userStore.user.id
      } else {
        // 管理员用户：需要指定student_id（这里可以添加一个学生选择字段）
        // 暂时使用一个默认值，实际应该让管理员选择学生
        if (!formData.student_id) {
          message.error('管理员创建工单时必须指定学生')
          return
        }
        submitData.student_id = formData.student_id
      }
    }

    if (editingId.value) {
      // 更新工单
      await repairApi.update(editingId.value, submitData)
      message.success('更新成功')
    } else {
      // 创建工单
      console.log('创建工单数据:', submitData)
      await repairApi.create(submitData)
      message.success('创建成功')
    }

    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response?.data?.message) {
      message.error(error.response.data.message)
    } else {
      message.error(editingId.value ? '更新失败' : '创建失败')
    }
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const showAssignModal = (record: any) => {
  currentRepair.value = record
  Object.assign(assignFormData, {
    staff_id: '',
    remark: '',
  })
  assignModalVisible.value = true
}

const handleAssignSubmit = async () => {
  try {
    await assignFormRef.value?.validate()

    const assignData = {
      staff_id: assignFormData.staff_id,
      remark: assignFormData.remark,
    }

    await repairApi.assign(currentRepair.value.id, assignData)
    message.success('分配成功')
    assignModalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('分配失败:', error)
    message.error('分配失败')
  }
}

const handleAssignCancel = () => {
  assignModalVisible.value = false
}

const showStatusModal = (record: any) => {
  currentRepair.value = record
  Object.assign(statusFormData, {
    status: '',
    remark: '',
  })
  statusModalVisible.value = true
}

const handleStatusSubmit = async () => {
  try {
    await statusFormRef.value?.validate()

    const statusData = {
      status: statusFormData.status,
      remark: statusFormData.remark,
    }

    await repairApi.updateStatus(currentRepair.value?.id, statusData)
    message.success('状态更新成功')
    statusModalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('状态更新失败:', error)
    message.error('状态更新失败')
  }
}

const handleStatusCancel = () => {
  statusModalVisible.value = false
}

const showDetail = async (record: any) => {
  currentRepair.value = record

  try {
    const response = await repairApi.getComments(record.id)
    repairComments.value = response.data || []
  } catch (error) {
    console.error('获取工单留言失败:', error)
    message.error('获取工单留言失败')
    repairComments.value = []
  }

  detailModalVisible.value = true
}

const addComment = async () => {
  if (!newComment.value.trim()) {
    message.warning('请输入留言内容')
    return
  }

  try {
    const commentData = {
      content: newComment.value.trim(),
    }

    await repairApi.addComment(currentRepair.value?.id, commentData)
    message.success('留言添加成功')
    newComment.value = ''
    // 重新获取留言列表
    showDetail(currentRepair.value)
  } catch (error) {
    console.error('添加留言失败:', error)
    message.error('添加留言失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await repairApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 生命周期
onMounted(() => {
  fetchBuildings()
  fetchStudents()
  fetchRepairStaff()
  fetchData()
})
</script>

<style scoped>
.repair-view {
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

.repair-detail {
  padding: 16px 0;
}

.comments-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

html.dark .comments-section {
  border-top-color: #303030;
}

.comment-item {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}

html.dark .comment-item {
  background: #262626;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

html.dark .comment-time {
  color: #666;
}

.comment-content {
  color: #666;
}

html.dark .comment-content {
  color: #ccc;
}
</style>
