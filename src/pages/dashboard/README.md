# 烧录统计 Dashboard

## 功能概述

这个 Dashboard 提供了完整的烧录统计分析功能，包括：

### 📊 统计卡片
- **今日成功**: 显示当天成功烧录次数
- **今日失败**: 显示当天失败烧录次数
- **今日总计**: 显示当天总烧录次数

### 📈 可视化图表

#### 1. 烧录趋势图
- 支持最近7天、最近30天、自定义日期范围
- 显示成功、失败、总计的趋势变化
- 支持导出 PNG 图片格式

#### 2. 成功率分析饼图
- 直观显示成功与失败的比例
- 支持导出 PNG 图片格式

### 📋 详细数据表格
- 显示每日详细统计数据
- 包含成功率进度条显示
- 支持导出 Excel 格式

## 后端实现

### Redis 存储结构
```
daily_burn_success_count:2025-01-07  -> 成功次数
daily_burn_failure_count:2025-01-07  -> 失败次数
```

### API 接口
- `GET /admin/dashboard` - 获取 Dashboard 统计数据
- `GET /admin/statistics?days=7` - 获取指定天数的统计数据

### 数据结构
```go
type BurnStatistics struct {
    Date         string `json:"date"`
    SuccessCount int64  `json:"successCount"`
    FailureCount int64  `json:"failureCount"`
    TotalCount   int64  `json:"totalCount"`
}

type DashboardStats struct {
    TodaySuccess int64            `json:"todaySuccess"`
    TodayFailure int64            `json:"todayFailure"`
    TodayTotal   int64            `json:"todayTotal"`
    WeeklyData   []BurnStatistics `json:"weeklyData"`
    MonthlyData  []BurnStatistics `json:"monthlyData"`
}
```

## 前端技术栈

- **Vue 3 + TypeScript**: 主框架
- **Ant Design Vue**: UI 组件库
- **ECharts**: 图表可视化
- **XLSX**: Excel 导出功能
- **dayjs**: 日期处理

## 特性

### 🎯 响应式设计
- 支持桌面端和移动端
- 图表自适应窗口大小

### 🔄 实时刷新
- 手动刷新按钮
- 数据自动更新

### 💾 数据导出
- 图表导出为 PNG 格式
- 表格数据导出为 Excel 格式

### 🎨 用户体验
- 加载状态显示
- 错误处理和提示
- 直观的数据可视化

## 使用说明

1. **访问 Dashboard**: 登录后点击左侧菜单的 "Dashboard"
2. **查看统计**: 页面自动加载今日和历史统计数据
3. **切换时间范围**: 使用趋势图右上角的下拉选择器
4. **导出数据**: 点击相应的导出按钮
5. **刷新数据**: 点击刷新按钮获取最新数据

## 权限要求

- 需要管理员权限才能访问统计功能
- 统计接口位于 `/admin/` 路径下，需要管理员 token 验证
