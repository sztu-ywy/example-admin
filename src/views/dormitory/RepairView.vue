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
            {{ record.room.building.name }} - {{ record.room.roomNumber }}
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
        <a-form-item label="优先级" name="priority">
          <a-select v-model:value="formData.priority" placeholder="请选择优先级">
            <a-select-option value="LOW">低</a-select-option>
            <a-select-option value="MEDIUM">中</a-select-option>
            <a-select-option value="HIGH">高</a-select-option>
            <a-select-option value="URGENT">紧急</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="楼栋" name="buildingId">
          <a-select 
            v-model:value="formData.buildingId" 
            placeholder="请选择楼栋"
            @change="onBuildingChange"
          >
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间" name="roomId">
          <a-select v-model:value="formData.roomId" placeholder="请选择房间">
            <a-select-option v-for="room in availableRooms" :key="room.id" :value="room.id">
              {{ room.roomNumber }}
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
        <a-form-item label="维修人员" name="staffId">
          <a-select v-model:value="assignFormData.staffId" placeholder="请选择维修人员">
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
            {{ currentRepair.room?.building?.name }} - {{ currentRepair.room?.roomNumber }}
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

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const buildings = ref([])
const availableRooms = ref([])
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
  buildingId: '',
  roomId: '',
})

// 分配表单数据
const assignFormData = reactive({
  staffId: '',
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
  roomId: [
    { required: true, message: '请选择房间', trigger: 'change' },
  ],
}

const assignFormRules = {
  staffId: [
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

const getPriorityText = (priority: string) => {
  const texts = {
    LOW: '低',
    MEDIUM: '中',
    HIGH: '高',
    URGENT: '紧急',
  }
  return texts[priority] || '未知'
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

const fetchRepairStaff = async () => {
  try {
    // TODO: 调用API获取维修人员列表
    repairStaff.value = [
      { id: 1, name: '维修师傅A', phone: '13800138000' },
      { id: 2, name: '维修师傅B', phone: '13800138001' },
    ]
  } catch (error) {
    message.error('获取维修人员列表失败')
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
        title: '水龙头漏水',
        description: '宿舍水龙头一直在滴水，需要维修',
        priority: 'MEDIUM',
        status: 'PENDING',
        student: {
          user: {
            name: '张三',
          },
        },
        room: {
          roomNumber: '101',
          building: {
            name: '1号楼',
          },
        },
        assignTo: null,
        createdAt: '2024-01-01 10:00:00',
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
    buildingId: '',
    roomId: '',
  })
  availableRooms.value = []
  formRef.value?.resetFields()
}

const onBuildingChange = async (buildingId: string) => {
  formData.roomId = ''
  
  if (buildingId) {
    try {
      // TODO: 调用API获取房间列表
      availableRooms.value = [
        { id: 1, roomNumber: '101' },
        { id: 2, roomNumber: '102' },
      ]
    } catch (error) {
      message.error('获取房间列表失败')
    }
  } else {
    availableRooms.value = []
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    // TODO: 调用API提交数据
    if (editingId.value) {
      message.success('更新成功')
    } else {
      message.success('创建成功')
    }
    
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const showAssignModal = (record: any) => {
  currentRepair.value = record
  Object.assign(assignFormData, {
    staffId: '',
    remark: '',
  })
  assignModalVisible.value = true
}

const handleAssignSubmit = async () => {
  try {
    await assignFormRef.value?.validate()
    
    // TODO: 调用API分配维修人员
    message.success('分配成功')
    assignModalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
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
    
    // TODO: 调用API更新状态
    message.success('状态更新成功')
    statusModalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleStatusCancel = () => {
  statusModalVisible.value = false
}

const showDetail = async (record: any) => {
  currentRepair.value = record
  
  try {
    // TODO: 调用API获取工单留言
    repairComments.value = [
      {
        id: 1,
        content: '已安排维修人员前往处理',
        user: { name: '管理员' },
        createdAt: '2024-01-01 11:00:00',
      },
    ]
  } catch (error) {
    message.error('获取工单留言失败')
  }
  
  detailModalVisible.value = true
}

const addComment = async () => {
  if (!newComment.value.trim()) {
    message.warning('请输入留言内容')
    return
  }
  
  try {
    // TODO: 调用API添加留言
    message.success('留言添加成功')
    newComment.value = ''
    // 重新获取留言列表
  } catch (error) {
    message.error('添加留言失败')
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

// 生命周期
onMounted(() => {
  fetchBuildings()
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
