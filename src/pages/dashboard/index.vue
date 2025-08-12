<script setup lang="ts">
import type { SelectValue } from 'ant-design-vue/es/select'
import type { Dayjs } from 'dayjs'
import type { DashboardStats } from '~/api/dashboard'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  ExportOutlined,
  PieChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import { dashboardApi } from '~/api/dashboard'

</script>