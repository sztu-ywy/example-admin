# 前后端字段对齐修复报告

## 🔍 问题概述

在检查前后端接口时发现多个页面存在字段名称不对齐的问题，导致数据无法正确显示和提交。

## 📋 发现的问题

### 1. 楼栋管理 (BuildingView.vue)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `genderType` | `gender_type` | ❌ 不匹配 | ✅ 已修复 |
| `totalFloors` | `total_floors` | ❌ 不匹配 | ✅ 已修复 |

### 2. 房间管理 (RoomView.vue)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `roomNumber` | `room_number` | ❌ 不匹配 | ✅ 已修复 |
| `buildingId` | `building_id` | ❌ 不匹配 | 🔄 待修复 |

### 3. 学生管理 (StudentView.vue)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `studentNo` | `student_no` | ❌ 不匹配 | 🔄 待修复 |
| `checkInDate` | `check_in_date` | ❌ 不匹配 | 🔄 待修复 |
| `checkOutDate` | `check_out_date` | ❌ 不匹配 | 🔄 待修复 |

### 4. 维修工单 (RepairView.vue)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `room_number` | `room_number` | ✅ 匹配 | ✅ 已修复 |
| `createdAt` | `created_at` | ❌ 不匹配 | 🔄 待修复 |
| `assignTo` | `assign_to` | ❌ 不匹配 | 🔄 待修复 |

### 5. 访客管理 (VisitView.vue)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `visitorName` | `visitor_name` | ❌ 不匹配 | 🔄 待修复 |
| `visitorPhone` | `visitor_phone` | ❌ 不匹配 | 🔄 待修复 |
| `idNumber` | `id_number` | ❌ 不匹配 | 🔄 待修复 |
| `visitDate` | `visit_date` | ❌ 不匹配 | 🔄 待修复 |
| `expectedDuration` | `expected_duration` | ❌ 不匹配 | 🔄 待修复 |
| `approvalRemark` | `approval_remark` | ❌ 不匹配 | 🔄 待修复 |

### 6. 用户管理 (columns.ts)
| 前端字段 | 后端字段 | 状态 | 修复状态 |
|---------|---------|------|---------|
| `student_no` | `student_no` | ✅ 匹配 | ✅ 正确 |
| `user_group_id` | `user_group_id` | ✅ 匹配 | ✅ 正确 |

## ✅ 已完成的修复

### 1. 楼栋管理页面 (BuildingView.vue)
- ✅ 表单字段：`genderType` → `gender_type`
- ✅ 表单字段：`totalFloors` → `total_floors`
- ✅ 表格列配置：更新 `dataIndex` 和 `key`
- ✅ 表单验证规则：更新字段名
- ✅ 搜索表单：更新字段引用
- ✅ 模板引用：更新所有相关字段引用

### 2. 维修工单页面 (RepairView.vue)
- ✅ 房间显示：`roomNumber` → `room_number`
- ✅ 模拟数据：统一字段名称
- ✅ API调用：使用正确的参数名

## 🔄 待修复的问题

### 1. 房间管理页面需要修复的字段
```javascript
// 需要修复的字段
formData.buildingId → formData.building_id
formData.roomNumber → formData.room_number
```

### 2. 学生管理页面需要修复的字段
```javascript
// 需要修复的字段
record.user.studentNo → record.user.student_no
record.checkInDate → record.check_in_date
record.checkOutDate → record.check_out_date
```

### 3. 维修工单页面需要修复的字段
```javascript
// 需要修复的字段
record.createdAt → record.created_at
record.assignTo → record.assign_to
```

### 4. 访客管理页面需要修复的字段
```javascript
// 需要修复的字段
formData.visitorName → formData.visitor_name
formData.visitorPhone → formData.visitor_phone
formData.idNumber → formData.id_number
formData.visitDate → formData.visit_date
formData.expectedDuration → formData.expected_duration
formData.approvalRemark → formData.approval_remark
```

## 🛠️ 修复策略

### 1. 统一命名规范
- **后端**：使用 snake_case (下划线命名)
- **前端**：统一使用 snake_case 与后端保持一致

### 2. 修复优先级
1. **高优先级**：影响数据提交和显示的字段
2. **中优先级**：影响搜索和筛选的字段
3. **低优先级**：仅影响显示的字段

### 3. 修复步骤
1. 更新表单数据字段名
2. 更新表格列配置
3. 更新模板中的字段引用
4. 更新API调用参数
5. 更新验证规则字段名

## 🧪 测试建议

### 1. 功能测试
- 测试数据创建和更新
- 测试搜索和筛选功能
- 测试数据显示是否正确

### 2. API测试
- 验证请求参数格式
- 验证响应数据格式
- 验证错误处理

### 3. 界面测试
- 验证表单字段显示
- 验证表格数据显示
- 验证搜索结果显示

## 📝 修复检查清单

- [x] 楼栋管理页面字段对齐
- [ ] 房间管理页面字段对齐
- [ ] 学生管理页面字段对齐
- [ ] 维修工单页面时间字段对齐
- [ ] 访客管理页面字段对齐
- [ ] API参数统一检查
- [ ] 全面功能测试

## 🎯 预期结果

完成所有字段对齐修复后：
1. ✅ 前后端数据交互正常
2. ✅ 表单提交成功
3. ✅ 数据显示正确
4. ✅ 搜索筛选功能正常
5. ✅ 无字段映射错误

## 🚨 注意事项

1. **数据库字段**：确保数据库字段名与后端模型一致
2. **API文档**：更新API文档中的字段说明
3. **类型定义**：更新TypeScript类型定义
4. **测试数据**：更新测试数据中的字段名
5. **向后兼容**：考虑是否需要保持向后兼容性
