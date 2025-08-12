<script setup lang ="ts">
import { StdCurd } from '@uozi-admin/curd'
import { userApi } from '~/api/user'
import { columns } from './columns'
</script>

<!-- 该页面的表头 -->
<template>
  <StdCurd
    title="用户管理"
    :api="userApi"
    :columns="columns"
  >
    <!-- 自定义操作列 -->
    <!-- <template #beforeActions="{ record }">
      <a-button type="link" @click="viewProfile(record.id)">
        查看详情
      </a-button>
      <a-button type="link" @click="resetPassword(record.id)">
        重置密码
      </a-button>
    </template> -->
  </StdCurd>
</template>
