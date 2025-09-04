<template>
  <div class="building-view">
    <div class="page-header">
      <h2>楼栋管理</h2>
      <a-button type="primary" @click="showCreateModal">
        <template #icon>
          <PlusOutlined />
        </template>
        新增楼栋
      </a-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="楼栋名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入楼栋名称" />
        </a-form-item>
        <a-form-item label="性别类型">
          <a-select v-model:value="searchForm.gender_type" placeholder="请选择性别类型" style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="M">男寝</a-select-option>
            <a-select-option value="F">女寝</a-select-option>
            <a-select-option value="U">混合</a-select-option>
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
        <template v-if="column.key === 'gender_type'">
          <a-tag :color="getGenderTypeColor(record.gender_type)">
            {{ getGenderTypeText(record.gender_type) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showStatistics(record)">统计</a-button>
            <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这个楼栋吗？"
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
        <a-form-item label="楼栋名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入楼栋名称" />
        </a-form-item>
        <a-form-item label="性别类型" name="gender_type">
          <a-select v-model:value="formData.gender_type" placeholder="请选择性别类型">
            <a-select-option value="M">男寝</a-select-option>
            <a-select-option value="F">女寝</a-select-option>
            <a-select-option value="U">混合</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="总楼层数" name="total_floors">
          <a-input-number
            v-model:value="formData.total_floors"
            :min="1"
            :max="50"
            placeholder="请输入总楼层数"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea
            v-model:value="formData.description"
            placeholder="请输入楼栋描述"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 统计模态框 -->
    <a-modal
      v-model:open="statisticsVisible"
      title="楼栋统计信息"
      :footer="null"
      width="600px"
    >
      <div v-if="statisticsData" class="statistics-content">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-statistic title="总房间数" :value="statisticsData.totalRooms" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="总床位数" :value="statisticsData.totalBeds" />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-statistic title="已入住床位" :value="statisticsData.occupiedBeds" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="空闲床位" :value="statisticsData.freeBeds" />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="24">
            <a-statistic
              title="入住率"
              :value="statisticsData.occupancyRate"
              suffix="%"
              :precision="1"
            />
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import { buildingApi } from '~/api/dormitory'

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const modalVisible = ref(false)
const statisticsVisible = ref(false)
const modalTitle = ref('新增楼栋')
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const statisticsData = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  gender_type: '',
})

// 表单数据
const formData = reactive({
  name: '',
  gender_type: '',
  total_floors: 1,
  description: '',
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
    title: '楼栋名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '性别类型',
    dataIndex: 'gender_type',
    key: 'gender_type',
    width: 100,
  },
  {
    title: '总楼层数',
    dataIndex: 'total_floors',
    key: 'total_floors',
    width: 100,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
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

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入楼栋名称', trigger: 'blur' },
    { min: 2, max: 50, message: '楼栋名称长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  gender_type: [
    { required: true, message: '请选择性别类型', trigger: 'change' },
  ],
  total_floors: [
    { required: true, message: '请输入总楼层数', trigger: 'blur' },
  ],
}

// 方法
const getGenderTypeColor = (type: string) => {
  const colors = { M: 'blue', F: 'pink', U: 'green' }
  return colors[type] || 'default'
}

const getGenderTypeText = (type: string) => {
  const texts = { M: '男寝', F: '女寝', U: '混合' }
  return texts[type] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      ...searchForm,
    }
    const response = await buildingApi.getList(params)
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
    gender_type: '',
  })
  handleSearch()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const showCreateModal = () => {
  modalTitle.value = '新增楼栋'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

const showEditModal = (record: any) => {
  modalTitle.value = '编辑楼栋'
  editingId.value = record.id
  Object.assign(formData, record)
  modalVisible.value = true
}

const resetForm = () => {
  Object.assign(formData, {
    name: '',
    genderType: '',
    totalFloors: 1,
    description: '',
  })
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (editingId.value) {
      await buildingApi.update(editingId.value, formData)
      message.success('更新成功')
    } else {
      await buildingApi.create(formData)
      message.success('创建成功')
    }

    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败:', error)
    message.error(editingId.value ? '更新失败' : '创建失败')
  }
}

const handleCancel = () => {
  modalVisible.value = false
  resetForm()
}

const handleDelete = async (id: number) => {
  try {
    await buildingApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

const showStatistics = async (record: any) => {
  try {
    const response = await buildingApi.getStatistics(record.id)
    statisticsData.value = response.data
    statisticsVisible.value = true
  } catch (error) {
    console.error('获取统计数据失败:', error)
    message.error('获取统计数据失败')
  }
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.building-view {
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

.statistics-content {
  padding: 16px 0;
}
</style>
