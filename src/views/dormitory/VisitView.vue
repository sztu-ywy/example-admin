<template>
  <div class="visit-view">
    <div class="page-header">
      <h2>访客管理</h2>
      <a-space>
        <a-button type="primary" @click="showCreateModal">
          <template #icon>
            <PlusOutlined />
          </template>
          登记访客
        </a-button>
        <a-button @click="showPendingVisits">
          <template #icon>
            <ClockCircleOutlined />
          </template>
          待审核访客
        </a-button>
      </a-space>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="访客姓名">
          <a-input v-model:value="searchForm.visitorName" placeholder="请输入访客姓名" />
        </a-form-item>
        <a-form-item label="学生姓名">
          <a-input v-model:value="searchForm.studentName" placeholder="请输入学生姓名" />
        </a-form-item>
        <a-form-item label="访问状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" style="width: 120px">
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="PENDING">待审核</a-select-option>
            <a-select-option value="APPROVED">已通过</a-select-option>
            <a-select-option value="REJECTED">已拒绝</a-select-option>
            <a-select-option value="FINISHED">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="访问日期">
          <a-range-picker
            v-model:value="searchForm.visitDateRange"
            format="YYYY-MM-DD"
            placeholder="['开始日期', '结束日期']"
          />
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
        <template v-else-if="column.key === 'visitTime'">
          <div>
            <div>{{ record.visitDate }}</div>
            <div style="font-size: 12px; color: #999;">
              {{ record.visitStartTime }} - {{ record.visitEndTime }}
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="showDetail(record)">详情</a-button>
            <a-button 
              v-if="record.status === 'PENDING'" 
              type="link" 
              size="small" 
              @click="handleApprove(record)"
            >
              通过
            </a-button>
            <a-button 
              v-if="record.status === 'PENDING'" 
              type="link" 
              size="small" 
              danger
              @click="showRejectModal(record)"
            >
              拒绝
            </a-button>
            <a-button 
              v-if="record.status === 'APPROVED'" 
              type="link" 
              size="small" 
              @click="handleFinish(record)"
            >
              结束访问
            </a-button>
            <a-button type="link" size="small" @click="showEditModal(record)">编辑</a-button>
            <a-popconfirm
              title="确定要删除这条访客记录吗？"
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
        <a-form-item label="访客姓名" name="visitorName">
          <a-input v-model:value="formData.visitorName" placeholder="请输入访客姓名" />
        </a-form-item>
        <a-form-item label="访客电话" name="visitorPhone">
          <a-input v-model:value="formData.visitorPhone" placeholder="请输入访客电话" />
        </a-form-item>
        <a-form-item label="身份证号" name="visitorIdCard">
          <a-input v-model:value="formData.visitorIdCard" placeholder="请输入身份证号" />
        </a-form-item>
        <a-form-item label="与学生关系" name="relationship">
          <a-select v-model:value="formData.relationship" placeholder="请选择关系">
            <a-select-option value="PARENT">家长</a-select-option>
            <a-select-option value="RELATIVE">亲属</a-select-option>
            <a-select-option value="FRIEND">朋友</a-select-option>
            <a-select-option value="OTHER">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="访问日期" name="visitDate">
          <a-date-picker
            v-model:value="formData.visitDate"
            format="YYYY-MM-DD"
            placeholder="请选择访问日期"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="访问时间">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-form-item name="visitStartTime">
                <a-time-picker
                  v-model:value="formData.visitStartTime"
                  format="HH:mm"
                  placeholder="开始时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="visitEndTime">
                <a-time-picker
                  v-model:value="formData.visitEndTime"
                  format="HH:mm"
                  placeholder="结束时间"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="访问目的" name="purpose">
          <a-textarea
            v-model:value="formData.purpose"
            placeholder="请输入访问目的"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 拒绝访问模态框 -->
    <a-modal
      v-model:open="rejectModalVisible"
      title="拒绝访问申请"
      @ok="handleRejectSubmit"
      @cancel="handleRejectCancel"
    >
      <a-form
        ref="rejectFormRef"
        :model="rejectFormData"
        :rules="rejectFormRules"
        layout="vertical"
      >
        <a-form-item label="拒绝原因" name="reason">
          <a-textarea
            v-model:value="rejectFormData.reason"
            placeholder="请输入拒绝原因"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 访客详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="访客详情"
      :footer="null"
      width="600px"
    >
      <div v-if="currentVisit" class="visit-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="访客姓名">{{ currentVisit.visitorName }}</a-descriptions-item>
          <a-descriptions-item label="访客电话">{{ currentVisit.visitorPhone }}</a-descriptions-item>
          <a-descriptions-item label="身份证号">{{ currentVisit.visitorIdCard }}</a-descriptions-item>
          <a-descriptions-item label="与学生关系">
            {{ getRelationshipText(currentVisit.relationship) }}
          </a-descriptions-item>
          <a-descriptions-item label="被访学生">{{ currentVisit.student?.user?.name }}</a-descriptions-item>
          <a-descriptions-item label="学号">{{ currentVisit.student?.user?.studentNo }}</a-descriptions-item>
          <a-descriptions-item label="访问日期">{{ currentVisit.visitDate }}</a-descriptions-item>
          <a-descriptions-item label="访问时间">
            {{ currentVisit.visitStartTime }} - {{ currentVisit.visitEndTime }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(currentVisit.status)">
              {{ getStatusText(currentVisit.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">{{ currentVisit.createdAt }}</a-descriptions-item>
          <a-descriptions-item label="访问目的" :span="2">
            {{ currentVisit.purpose }}
          </a-descriptions-item>
          <a-descriptions-item 
            v-if="currentVisit.approvalRemark" 
            label="审核备注" 
            :span="2"
          >
            {{ currentVisit.approvalRemark }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType, FormInstance } from 'ant-design-vue'
import dayjs from 'dayjs'
import { visitApi } from '~/api/dormitory'

// 响应式数据
const loading = ref(false)
const dataSource = ref([])
const modalVisible = ref(false)
const rejectModalVisible = ref(false)
const detailModalVisible = ref(false)
const modalTitle = ref('登记访客')
const editingId = ref<number | null>(null)
const currentVisit = ref(null)
const formRef = ref<FormInstance>()
const rejectFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  visitorName: '',
  studentName: '',
  status: '',
  visitDateRange: [],
})

// 表单数据
const formData = reactive({
  visitorName: '',
  visitorPhone: '',
  visitorIdCard: '',
  relationship: '',
  visitDate: null,
  visitStartTime: null,
  visitEndTime: null,
  purpose: '',
})

// 拒绝表单数据
const rejectFormData = reactive({
  reason: '',
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
    title: '访客姓名',
    dataIndex: 'visitorName',
    key: 'visitorName',
    width: 100,
  },
  {
    title: '访客电话',
    dataIndex: 'visitorPhone',
    key: 'visitorPhone',
    width: 120,
  },
  {
    title: '被访学生',
    dataIndex: ['student', 'user', 'name'],
    key: 'studentName',
    width: 100,
  },
  {
    title: '访问时间',
    key: 'visitTime',
    width: 150,
  },
  {
    title: '关系',
    dataIndex: 'relationship',
    key: 'relationship',
    width: 80,
    customRender: ({ text }) => getRelationshipText(text),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '申请时间',
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
  visitorName: [
    { required: true, message: '请输入访客姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  visitorPhone: [
    { required: true, message: '请输入访客电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  visitorIdCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' },
  ],
  relationship: [
    { required: true, message: '请选择与学生关系', trigger: 'change' },
  ],
  visitDate: [
    { required: true, message: '请选择访问日期', trigger: 'change' },
  ],
  visitStartTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
  ],
  visitEndTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
  ],
  purpose: [
    { required: true, message: '请输入访问目的', trigger: 'blur' },
    { min: 5, max: 200, message: '访问目的长度在 5 到 200 个字符', trigger: 'blur' },
  ],
}

const rejectFormRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, max: 200, message: '拒绝原因长度在 5 到 200 个字符', trigger: 'blur' },
  ],
}

// 方法
const getStatusColor = (status: string) => {
  const colors = {
    PENDING: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
    FINISHED: 'blue',
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    FINISHED: '已结束',
  }
  return texts[status] || '未知'
}

const getRelationshipText = (relationship: string) => {
  const texts = {
    PARENT: '家长',
    RELATIVE: '亲属',
    FRIEND: '朋友',
    OTHER: '其他',
  }
  return texts[relationship] || '未知'
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      ...searchForm,
    }
    const response = await visitApi.getList(params)
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
    visitorName: '',
    studentName: '',
    status: '',
    visitDateRange: [],
  })
  handleSearch()
}

const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const showCreateModal = () => {
  modalTitle.value = '登记访客'
  editingId.value = null
  resetForm()
  modalVisible.value = true
}

const showEditModal = (record: any) => {
  modalTitle.value = '编辑访客'
  editingId.value = record.id
  Object.assign(formData, {
    ...record,
    visitDate: record.visitDate ? dayjs(record.visitDate) : null,
    visitStartTime: record.visitStartTime ? dayjs(record.visitStartTime, 'HH:mm') : null,
    visitEndTime: record.visitEndTime ? dayjs(record.visitEndTime, 'HH:mm') : null,
  })
  modalVisible.value = true
}

const showPendingVisits = () => {
  searchForm.status = 'PENDING'
  handleSearch()
}

const resetForm = () => {
  Object.assign(formData, {
    visitorName: '',
    visitorPhone: '',
    visitorIdCard: '',
    relationship: '',
    visitDate: null,
    visitStartTime: null,
    visitEndTime: null,
    purpose: '',
  })
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    // 验证时间逻辑
    if (formData.visitStartTime && formData.visitEndTime) {
      if (formData.visitStartTime.isAfter(formData.visitEndTime)) {
        message.error('开始时间不能晚于结束时间')
        return
      }
    }
    
    if (editingId.value) {
      await visitApi.update(editingId.value, formData)
      message.success('更新成功')
    } else {
      await visitApi.create(formData)
      message.success('登记成功')
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

const handleApprove = async (record: any) => {
  try {
    await visitApi.approve(record.id)
    message.success('审核通过')
    fetchData()
  } catch (error) {
    console.error('审核失败:', error)
    message.error('审核失败')
  }
}

const showRejectModal = (record: any) => {
  currentVisit.value = record
  rejectFormData.reason = ''
  rejectModalVisible.value = true
}

const handleRejectSubmit = async () => {
  try {
    await rejectFormRef.value?.validate()
    
    const rejectData = {
      remark: rejectFormData.remark,
    }

    await visitApi.reject(currentVisit.value?.id, rejectData)
    message.success('已拒绝访问申请')
    rejectModalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleRejectCancel = () => {
  rejectModalVisible.value = false
}

const handleFinish = async (record: any) => {
  try {
    await visitApi.finish(record.id)
    message.success('访问已结束')
    fetchData()
  } catch (error) {
    console.error('操作失败:', error)
    message.error('操作失败')
  }
}

const showDetail = (record: any) => {
  currentVisit.value = record
  detailModalVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await visitApi.delete(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
    message.error('删除失败')
  }
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.visit-view {
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

.visit-detail {
  padding: 16px 0;
}
</style>
