<template>
  <div class="room-view">
    <div class="page-header">
      <h2>房间管理</h2>
      <a-button type="primary" @click="showCreateModal">
        <template #icon>
          <PlusOutlined />
        </template>
        新增房间
      </a-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="楼栋">
          <a-select v-model:value="searchForm.buildingId" placeholder="请选择楼栋" style="width: 150px">
            <a-select-option value="">全部楼栋</a-select-option>
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间号">
          <a-input v-model:value="searchForm.roomNumber" placeholder="请输入房间号" />
        </a-form-item>
        <a-form-item label="房间类型">
          <a-select v-model:value="searchForm.type" placeholder="请选择房间类型" style="width: 120px">
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="STANDARD">标准间</a-select-option>
            <a-select-option value="SUITE">套间</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="可用状态">
          <a-select v-model:value="searchForm.available" placeholder="请选择状态" style="width: 100px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="true">可用</a-select-option>
            <a-select-option :value="false">不可用</a-select-option>
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
        <template v-if="column.key === 'type'">
          <a-tag :color="record.type === 'STANDARD' ? 'blue' : 'green'">
            {{ record.type === 'STANDARD' ? '标准间' : '套间' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'available'">
          <a-tag :color="record.available ? 'green' : 'red'">
            {{ record.available ? '可用' : '不可用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'occupancy'">
          <a-progress
            :percent="(record.currentCount / record.capacity) * 100"
            :format="() => `${record.currentCount}/${record.capacity}`"
            size="small"
          />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showBeds(record)">床位</a-button>
            <a-button type="link" size="small" @click="showStudents(record)">学生</a-button>
            <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个房间吗？"
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
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item label="所属楼栋" name="buildingId">
          <a-select v-model:value="formData.buildingId" placeholder="请选择楼栋">
            <a-select-option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="房间号" name="roomNumber">
          <a-input v-model:value="formData.roomNumber" placeholder="请输入房间号" />
        </a-form-item>
        <a-form-item label="房间类型" name="type">
          <a-select v-model:value="formData.type" placeholder="请选择房间类型">
            <a-select-option value="STANDARD">标准间</a-select-option>
            <a-select-option value="SUITE">套间</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="容量" name="capacity">
          <a-input-number
            v-model:value="formData.capacity"
            :min="1"
            :max="8"
            placeholder="请输入房间容量"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="可用状态" name="available">
          <a-switch v-model:checked="formData.available" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 床位列表模态框 -->
    <a-modal
      v-model:open="bedsVisible"
      title="床位列表"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="bedColumns"
        :data-source="bedList"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'FREE' ? 'green' : 'red'">
              {{ record.status === 'FREE' ? '空闲' : '已入住' }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 学生列表模态框 -->
    <a-modal
      v-model:open="studentsVisible"
      title="房间学生"
      :footer="null"
      width="800px"
    >
      <a-table
        :columns="studentColumns"
        :data-source="studentList"
        :pagination="false"
        size="small"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag color="green">在住</a-tag>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const buildings = ref([])
const modalVisible = ref(false)
const bedsVisible = ref(false)
const studentsVisible = ref(false)
const modalTitle = ref('新增房间')
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const bedList = ref([])
const studentList = ref([])

// 搜索表单
const searchForm = reactive({
  buildingId: '',
  roomNumber: '',
  type: '',
  available: '',
})

// 表单数据
const formData = reactive({
  buildingId: '',
  roomNumber: '',
  type: 'STANDARD',
  capacity: 4,
  available: true,
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
    title: '楼栋',
    dataIndex: ['building', 'name'],
    key: 'buildingName',
    width: 100,
  },
  {
    title: '房间号',
    dataIndex: 'roomNumber',
    key: 'roomNumber',
    width: 100,
  },
  {
    title: '房间类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '入住情况',
    key: 'occupancy',
    width: 150,
  },
  {
    title: '可用状态',
    dataIndex: 'available',
    key: 'available',
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
    width: 200,
  },
]

// 床位表格列
const bedColumns: TableColumnsType = [
  {
    title: '床位号',
    dataIndex: 'bedCode',
    key: 'bedCode',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '学生姓名',
    dataIndex: ['student', 'user', 'name'],
    key: 'studentName',
  },
  {
    title: '学号',
    dataIndex: ['student', 'user', 'studentNo'],
    key: 'studentNo',
  },
]

// 学生表格列
const studentColumns: TableColumnsType = [
  {
    title: '姓名',
    dataIndex: ['user', 'name'],
    key: 'name',
  },
  {
    title: '学号',
    dataIndex: ['user', 'studentNo'],
    key: 'studentNo',
  },
  {
    title: '床位号',
    dataIndex: ['bed', 'bedCode'],
    key: 'bedCode',
  },
  {
    title: '入住时间',
    dataIndex: 'checkInDate',
    key: 'checkInDate',
  },
  {
    title: '状态',
    key: 'status',
  },
]

// 表单验证规则
const formRules = {
  buildingId: [
    { required: true, message: '请选择楼栋', trigger: 'change' },
  ],
  roomNumber: [
    { required: true, message: '请输入房间号', trigger: 'blur' },
    { min: 1, max: 20, message: '房间号长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择房间类型', trigger: 'change' },
  ],
  capacity: [
    { required: true, message: '请输入房间容量', trigger: 'blur' },
  ],
}

// 方法
const fetchBuildings = async () => {
  try {
    // TODO: 调用API获取楼栋列表
    // const response = await buildingApi.getList()
    // buildings.value = response.data
    
    // 模拟数据
    buildings.value = [
      { id: 1, name: '1号楼' },
      { id: 2, name: '2号楼' },
      { id: 3, name: '3号楼' },
    ]
  } catch (error) {
    message.error('获取楼栋列表失败')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取数据
    // const response = await roomApi.getList({
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    //   ...searchForm,
    // })
    // dataSource.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    dataSource.value = [
      {
        id: 1,
        roomNumber: '101',
        type: 'STANDARD',
        capacity: 4,
        currentCount: 3,
        available: true,
        building: { name: '1号楼' },
        createdAt: '2024-01-01 10:00:00',
      },
      {
        id: 2,
        roomNumber: '102',
        type: 'SUITE',
        capacity: 2,
        currentCount: 2,
        available: true,
        building: { name: '1号楼' },
        createdAt: '2024-01-01 10:00:00',
      },
    ]
    pagination.total = 2
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
    buildingId: '',
    roomNumber: '',
    type: '',
    available: '',
  })
  handleSearch()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const showCreateModal = () => {
  modalTitle.value = '新增房间'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

const showEditModal = (record: any) => {
  modalTitle.value = '编辑房间'
  editingId.value = record.id
  Object.assign(formData, record)
  modalVisible.value = true
}

const resetForm = () => {
  Object.assign(formData, {
    buildingId: '',
    roomNumber: '',
    type: 'STANDARD',
    capacity: 4,
    available: true,
  })
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    // TODO: 调用API提交数据
    if (editingId.value) {
      // await roomApi.update(editingId.value, formData)
      message.success('更新成功')
    } else {
      // await roomApi.create(formData)
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

const handleDelete = async (id: number) => {
  try {
    // TODO: 调用API删除数据
    // await roomApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const showBeds = async (record: any) => {
  try {
    // TODO: 调用API获取床位列表
    // const response = await roomApi.getBeds(record.id)
    // bedList.value = response.data
    
    // 模拟数据
    bedList.value = [
      {
        id: 1,
        bedCode: '1',
        status: 'OCCUPIED',
        student: {
          user: {
            name: '张三',
            studentNo: '2021001',
          },
        },
      },
      {
        id: 2,
        bedCode: '2',
        status: 'FREE',
      },
    ]
    
    bedsVisible.value = true
  } catch (error) {
    message.error('获取床位列表失败')
  }
}

const showStudents = async (record: any) => {
  try {
    // TODO: 调用API获取学生列表
    // const response = await roomApi.getStudents(record.id)
    // studentList.value = response.data
    
    // 模拟数据
    studentList.value = [
      {
        id: 1,
        user: {
          name: '张三',
          studentNo: '2021001',
        },
        bed: {
          bedCode: '1',
        },
        checkInDate: '2024-01-01',
      },
    ]
    
    studentsVisible.value = true
  } catch (error) {
    message.error('获取学生列表失败')
  }
}

// 生命周期
onMounted(() => {
  fetchBuildings()
  fetchData()
})
</script>

<style scoped>
.room-view {
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
