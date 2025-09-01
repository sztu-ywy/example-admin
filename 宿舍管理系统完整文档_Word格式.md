# 宿舍管理系统完整技术文档

**项目名称：** 宿舍管理系统  
**文档版本：** 1.0.0  
**编写日期：** 2024年1月1日  
**编写人员：** 系统开发团队  

---

## 目录

1. [系统概述](#1-系统概述)
2. [技术架构](#2-技术架构)
3. [数据库设计](#3-数据库设计)
4. [API接口设计](#4-api接口设计)
5. [前端设计](#5-前端设计)
6. [测试方案](#6-测试方案)
7. [部署指南](#7-部署指南)
8. [运维监控](#8-运维监控)

---

## 1. 系统概述

### 1.1 项目背景

宿舍管理系统是一个现代化的学生宿舍综合管理平台，旨在提高宿舍管理效率，优化学生住宿体验，实现宿舍资源的智能化分配和精细化管理。

### 1.2 系统目标

- **提高管理效率：** 自动化宿舍分配、维修工单处理、访客管理等流程
- **优化用户体验：** 提供直观易用的管理界面和学生服务界面
- **数据驱动决策：** 通过统计分析支持管理决策
- **系统可扩展性：** 支持多校区、大规模用户的扩展需求

### 1.3 核心功能模块

| 模块名称 | 功能描述 | 主要特性 |
|----------|----------|----------|
| 楼栋管理 | 宿舍楼基础信息管理 | 楼栋信息维护、统计分析 |
| 房间管理 | 房间和床位的精细化管理 | 房间分配、床位状态管理 |
| 学生住宿 | 智能分配算法和住宿生命周期管理 | 自动分配、手动调整、退宿管理 |
| 维修工单 | 完整的报修流程和工单跟踪 | 工单创建、分配、处理、跟踪 |
| 访客管理 | 访客登记和审批流程 | 访客登记、审核、访问控制 |
| 统计分析 | 多维度数据统计和可视化展示 | 入住率、维修统计、访客统计 |

---

## 2. 技术架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户访问层                                │
├─────────────────┬─────────────────┬─────────────────────────┤
│   管理员界面     │   学生界面       │      移动端界面          │
│   (Admin Web)   │  (Student Web)  │    (Mobile App)        │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      前端应用层                                │
├─────────────────────────────────────────────────────────────┤
│  Vue 3 + TypeScript + Ant Design Vue + Admin Kit           │
│  • 组件化开发  • 响应式设计  • 权限控制  • 国际化支持        │
└─────────────────────────────┬─────────────────────────────────┘
                              │ HTTP/HTTPS
┌─────────────────────────────▼─────────────────────────────────┐
│                      API网关层                                │
├─────────────────────────────────────────────────────────────┤
│  Nginx + SSL + 负载均衡 + 反向代理 + 缓存                    │
│  • 请求路由  • 安全防护  • 限流控制  • 日志记录              │
└─────────────────────────────┬─────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                    后端服务层                                  │
├─────────────────────────────────────────────────────────────┤
│  Go + Cosy Framework + GORM + JWT                           │
│  • RESTful API  • 微服务架构  • 中间件支持  • 异步处理       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   用户服务       │   宿舍服务       │      工单服务            │
│  (User Service) │(Dormitory Svc)  │   (Repair Service)     │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                    数据存储层                                  │
├─────────────────┬─────────────────┬─────────────────────────┤
│   主数据库       │   缓存数据库     │      文件存储            │
│  MySQL 8.0      │   Redis 6.0     │   MinIO/OSS            │
│  • 事务支持      │   • 高性能缓存   │   • 文件上传下载        │
│  • 读写分离      │   • 会话存储     │   • 图片视频存储        │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 2.2 技术选型对比

| 技术类别 | 选择方案 | 备选方案 | 选择理由 |
|----------|----------|----------|----------|
| 前端框架 | Vue 3 | React, Angular | 学习成本低，生态完善，性能优秀 |
| UI组件库 | Ant Design Vue | Element Plus, Vuetify | 组件丰富，设计规范，企业级应用 |
| 后端语言 | Go | Java, Python, Node.js | 高性能，并发支持好，部署简单 |
| Web框架 | Cosy | Gin, Echo, Fiber | 功能完整，开发效率高，社区活跃 |
| 数据库 | MySQL | PostgreSQL, MongoDB | 稳定可靠，生态成熟，运维简单 |
| 缓存 | Redis | Memcached, Hazelcast | 功能丰富，性能优秀，持久化支持 |

### 2.3 系统性能指标

| 性能指标 | 目标值 | 测试方法 |
|----------|--------|----------|
| 响应时间 | < 200ms | 压力测试 |
| 并发用户 | 1000+ | 负载测试 |
| 系统可用性 | 99.9% | 监控统计 |
| 数据一致性 | 100% | 事务测试 |
| 安全性 | A级 | 安全扫描 |

---

## 3. 数据库设计

### 3.1 数据库E-R关系图

```
用户表(users) ──┐
               ├── 学生表(students) ── 床位表(beds) ── 房间表(rooms) ── 楼栋表(buildings)
               │
               ├── 维修工单表(repairs) ── 房间表(rooms)
               │
               ├── 访客表(visits) ── 学生表(students)
               │
               └── 工单留言表(repair_comments) ── 维修工单表(repairs)

用户组表(user_groups) ── 用户表(users)
```

### 3.2 核心数据表设计

#### 3.2.1 用户表 (users)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| name | VARCHAR | 100 | NOT NULL | 用户姓名 |
| email | VARCHAR | 255 | NOT NULL, UNIQUE | 邮箱地址 |
| password | VARCHAR | 255 | NOT NULL | 密码（加密） |
| phone | VARCHAR | 20 | NULL | 手机号码 |
| student_no | VARCHAR | 50 | NULL | 学号 |
| gender | ENUM | - | NULL | 性别：M(男),F(女) |
| user_group_id | INT | - | NOT NULL, FK | 用户组ID |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- UNIQUE KEY: `email`
- INDEX: `idx_users_student_no`, `idx_users_user_group_id`, `idx_users_deleted_at`

#### 3.2.2 楼栋表 (buildings)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 楼栋ID |
| name | VARCHAR | 100 | NOT NULL, UNIQUE | 楼栋名称 |
| gender_type | ENUM | - | NOT NULL | 性别类型：M(男寝),F(女寝),U(混合) |
| total_floors | INT | - | NOT NULL, DEFAULT 1 | 总楼层数 |
| description | TEXT | - | NULL | 楼栋描述 |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- UNIQUE KEY: `name`
- INDEX: `idx_buildings_gender_type`, `idx_buildings_deleted_at`

#### 3.2.3 房间表 (rooms)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 房间ID |
| building_id | INT | - | NOT NULL, FK | 楼栋ID |
| room_number | VARCHAR | 20 | NOT NULL | 房间号 |
| type | ENUM | - | NOT NULL, DEFAULT 'STANDARD' | 房间类型：STANDARD(标准间),SUITE(套间) |
| capacity | INT | - | NOT NULL, DEFAULT 4 | 房间容量 |
| available | BOOLEAN | - | NOT NULL, DEFAULT TRUE | 是否可用 |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- INDEX: `idx_rooms_building_id`
- UNIQUE KEY: `uk_rooms_building_room` (building_id, room_number)
- INDEX: `idx_rooms_type`, `idx_rooms_available`, `idx_rooms_deleted_at`

#### 3.2.4 床位表 (beds)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 床位ID |
| room_id | INT | - | NOT NULL, FK | 房间ID |
| bed_code | VARCHAR | 10 | NOT NULL | 床位编号 |
| status | ENUM | - | NOT NULL, DEFAULT 'FREE' | 床位状态：FREE(空闲),OCCUPIED(已占用),MAINTENANCE(维护中) |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- INDEX: `idx_beds_room_id`
- UNIQUE KEY: `uk_beds_room_bed` (room_id, bed_code)
- INDEX: `idx_beds_status`, `idx_beds_deleted_at`

#### 3.2.5 学生住宿表 (students)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 住宿记录ID |
| user_id | INT | - | NOT NULL, FK | 用户ID |
| bed_id | INT | - | NOT NULL, FK | 床位ID |
| check_in_date | DATE | - | NOT NULL | 入住日期 |
| check_out_date | DATE | - | NULL | 退宿日期 |
| status | ENUM | - | NOT NULL, DEFAULT 'LIVING' | 住宿状态：LIVING(在住),CHECKED_OUT(已退宿) |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- INDEX: `idx_students_user_id`, `idx_students_bed_id`, `idx_students_status`
- INDEX: `idx_students_check_in_date`, `idx_students_deleted_at`

#### 3.2.6 维修工单表 (repairs)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 工单ID |
| title | VARCHAR | 200 | NOT NULL | 工单标题 |
| description | TEXT | - | NOT NULL | 问题描述 |
| priority | ENUM | - | NOT NULL, DEFAULT 'MEDIUM' | 优先级：LOW(低),MEDIUM(中),HIGH(高),URGENT(紧急) |
| status | ENUM | - | NOT NULL, DEFAULT 'PENDING' | 状态：PENDING(待处理),PROCESSING(处理中),COMPLETED(已完成) |
| student_id | INT | - | NOT NULL, FK | 提交学生ID |
| room_id | INT | - | NOT NULL, FK | 房间ID |
| assign_to | INT | - | NULL, FK | 分配给维修人员ID |
| approval_remark | TEXT | - | NULL | 处理备注 |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- INDEX: `idx_repairs_student_id`, `idx_repairs_room_id`, `idx_repairs_assign_to`
- INDEX: `idx_repairs_status`, `idx_repairs_priority`, `idx_repairs_created_at`, `idx_repairs_deleted_at`

#### 3.2.7 访客表 (visits)

| 字段名 | 数据类型 | 长度 | 约束 | 说明 |
|--------|----------|------|------|------|
| id | INT | - | PRIMARY KEY, AUTO_INCREMENT | 访客记录ID |
| visitor_name | VARCHAR | 100 | NOT NULL | 访客姓名 |
| visitor_phone | VARCHAR | 20 | NOT NULL | 访客电话 |
| visitor_id_card | VARCHAR | 18 | NOT NULL | 访客身份证号 |
| relationship | ENUM | - | NOT NULL | 与学生关系：PARENT(家长),RELATIVE(亲属),FRIEND(朋友),OTHER(其他) |
| student_id | INT | - | NOT NULL, FK | 被访学生ID |
| visit_date | DATE | - | NOT NULL | 访问日期 |
| visit_start_time | TIME | - | NOT NULL | 访问开始时间 |
| visit_end_time | TIME | - | NOT NULL | 访问结束时间 |
| purpose | TEXT | - | NOT NULL | 访问目的 |
| status | ENUM | - | NOT NULL, DEFAULT 'PENDING' | 状态：PENDING(待审核),APPROVED(已通过),REJECTED(已拒绝),FINISHED(已结束) |
| approval_remark | TEXT | - | NULL | 审核备注 |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | - | NULL | 软删除时间 |

**索引设计：**
- PRIMARY KEY: `id`
- INDEX: `idx_visits_student_id`, `idx_visits_visitor_phone`, `idx_visits_visitor_id_card`
- INDEX: `idx_visits_visit_date`, `idx_visits_status`, `idx_visits_created_at`, `idx_visits_deleted_at`

### 3.3 数据库性能优化

#### 3.3.1 索引优化策略
1. **主键索引：** 所有表都使用自增主键，提供最佳的插入性能
2. **唯一索引：** 用于保证数据唯一性，如用户邮箱、楼栋名称等
3. **复合索引：** 针对多字段查询场景，如楼栋+房间号的组合查询
4. **覆盖索引：** 包含查询所需的所有字段，减少回表操作

#### 3.3.2 查询优化示例
```sql
-- 高效的分页查询
SELECT * FROM students 
WHERE deleted_at IS NULL 
ORDER BY id DESC 
LIMIT 20 OFFSET 0;

-- 使用索引的范围查询
SELECT * FROM visits 
WHERE visit_date BETWEEN '2024-01-01' AND '2024-01-31'
AND status = 'APPROVED';

-- 连接查询优化
SELECT s.*, u.name, u.student_no, r.room_number, b.name as building_name
FROM students s
JOIN users u ON s.user_id = u.id
JOIN beds bed ON s.bed_id = bed.id
JOIN rooms r ON bed.room_id = r.id
JOIN buildings b ON r.building_id = b.id
WHERE s.status = 'LIVING' AND s.deleted_at IS NULL;
```

---

## 4. API接口设计

### 4.1 接口规范

#### 4.1.1 RESTful API设计原则
- **统一的URL格式：** `/api/v1/{resource}`
- **HTTP方法语义：** GET(查询)、POST(创建)、PUT(更新)、DELETE(删除)
- **状态码规范：** 200(成功)、201(创建成功)、400(请求错误)、401(未授权)、403(禁止访问)、404(未找到)、500(服务器错误)
- **响应格式统一：** JSON格式，包含code、message、data字段

#### 4.1.2 接口响应格式
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 具体数据
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4.2 核心API接口

#### 4.2.1 用户认证接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户登录 | POST | `/api/v1/auth/login` | 用户登录认证 |
| 用户登出 | POST | `/api/v1/auth/logout` | 用户登出 |
| 刷新Token | POST | `/api/v1/auth/refresh` | 刷新访问令牌 |
| 获取用户信息 | GET | `/api/v1/auth/profile` | 获取当前用户信息 |

**登录接口示例：**
```json
// 请求
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}

// 响应
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "管理员",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

#### 4.2.2 楼栋管理接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取楼栋列表 | GET | `/api/v1/buildings` | 分页获取楼栋列表 |
| 获取楼栋详情 | GET | `/api/v1/buildings/{id}` | 获取指定楼栋详情 |
| 创建楼栋 | POST | `/api/v1/buildings` | 创建新楼栋 |
| 更新楼栋 | PUT | `/api/v1/buildings/{id}` | 更新楼栋信息 |
| 删除楼栋 | DELETE | `/api/v1/buildings/{id}` | 删除楼栋 |
| 楼栋统计 | GET | `/api/v1/buildings/{id}/statistics` | 获取楼栋统计信息 |

#### 4.2.3 房间管理接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取房间列表 | GET | `/api/v1/rooms` | 分页获取房间列表 |
| 获取房间详情 | GET | `/api/v1/rooms/{id}` | 获取指定房间详情 |
| 创建房间 | POST | `/api/v1/rooms` | 创建新房间 |
| 更新房间 | PUT | `/api/v1/rooms/{id}` | 更新房间信息 |
| 删除房间 | DELETE | `/api/v1/rooms/{id}` | 删除房间 |
| 获取房间床位 | GET | `/api/v1/rooms/{id}/beds` | 获取房间床位列表 |
| 获取房间学生 | GET | `/api/v1/rooms/{id}/students` | 获取房间学生列表 |

#### 4.2.4 学生住宿接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取学生住宿列表 | GET | `/api/v1/students` | 分页获取学生住宿列表 |
| 获取未分配学生 | GET | `/api/v1/students/unassigned` | 获取未分配宿舍的学生 |
| 分配宿舍 | POST | `/api/v1/students/assign` | 手动分配学生宿舍 |
| 自动分配宿舍 | POST | `/api/v1/students/auto-assign` | 自动分配学生宿舍 |
| 学生退宿 | PUT | `/api/v1/students/{id}/checkout` | 学生退宿处理 |

#### 4.2.5 维修工单接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取工单列表 | GET | `/api/v1/repairs` | 分页获取维修工单列表 |
| 获取工单详情 | GET | `/api/v1/repairs/{id}` | 获取指定工单详情 |
| 创建工单 | POST | `/api/v1/repairs` | 创建新维修工单 |
| 更新工单 | PUT | `/api/v1/repairs/{id}` | 更新工单信息 |
| 分配维修人员 | PUT | `/api/v1/repairs/{id}/assign` | 分配维修人员 |
| 更新工单状态 | PUT | `/api/v1/repairs/{id}/status` | 更新工单状态 |
| 添加工单留言 | POST | `/api/v1/repairs/{id}/comments` | 添加工单留言 |
| 获取待处理工单 | GET | `/api/v1/repairs/pending` | 获取待处理工单列表 |

#### 4.2.6 访客管理接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取访客列表 | GET | `/api/v1/visits` | 分页获取访客列表 |
| 获取访客详情 | GET | `/api/v1/visits/{id}` | 获取指定访客详情 |
| 登记访客 | POST | `/api/v1/visits` | 登记新访客 |
| 更新访客信息 | PUT | `/api/v1/visits/{id}` | 更新访客信息 |
| 审核访客 | PUT | `/api/v1/visits/{id}/approve` | 审核通过访客申请 |
| 拒绝访客 | PUT | `/api/v1/visits/{id}/reject` | 拒绝访客申请 |
| 结束访问 | PUT | `/api/v1/visits/{id}/finish` | 结束访客访问 |
| 获取待审核访客 | GET | `/api/v1/visits/pending` | 获取待审核访客列表 |

### 4.3 接口安全设计

#### 4.3.1 认证机制
- **JWT Token认证：** 使用JSON Web Token进行用户身份认证
- **Token过期机制：** 访问令牌有效期2小时，刷新令牌有效期7天
- **权限验证：** 基于角色的访问控制(RBAC)

#### 4.3.2 安全防护
- **请求限流：** 每个IP每分钟最多100次请求
- **参数验证：** 严格验证所有输入参数
- **SQL注入防护：** 使用参数化查询
- **XSS防护：** 输入输出过滤

---

## 5. 前端设计

### 5.1 前端架构

#### 5.1.1 技术栈选择

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Vue.js | 3.4+ | 前端框架 | 响应式设计，组件化开发，生态完善 |
| TypeScript | 5.0+ | 类型安全 | 提供类型检查，提高代码质量 |
| Vite | 6.0+ | 构建工具 | 快速构建，热更新，现代化工具链 |
| Ant Design Vue | 4.0+ | UI组件库 | 企业级组件，设计规范，功能完整 |
| Vue Router | 4.0+ | 路由管理 | 单页应用路由，权限控制 |
| Pinia | 2.0+ | 状态管理 | 轻量级状态管理，TypeScript支持 |
| ECharts | 5.0+ | 数据可视化 | 丰富的图表类型，交互性强 |

#### 5.1.2 项目结构
```
dormitory-web/
├── public/                 # 静态资源
│   ├── favicon.ico        # 网站图标
│   └── index.html         # HTML模板
├── src/                   # 源代码
│   ├── api/              # API接口定义
│   │   ├── auth.ts       # 认证相关API
│   │   ├── building.ts   # 楼栋管理API
│   │   ├── room.ts       # 房间管理API
│   │   ├── student.ts    # 学生管理API
│   │   ├── repair.ts     # 维修工单API
│   │   └── visit.ts      # 访客管理API
│   ├── components/       # 公共组件
│   │   ├── common/       # 通用组件
│   │   ├── charts/       # 图表组件
│   │   └── forms/        # 表单组件
│   ├── constants/        # 常量定义
│   │   ├── acl.ts       # 权限常量
│   │   └── enums.ts     # 枚举定义
│   ├── layouts/          # 布局组件
│   │   ├── AdminLayout.vue    # 管理员布局
│   │   └── StudentLayout.vue  # 学生布局
│   ├── pages/            # 页面组件
│   │   ├── dashboard/    # 仪表盘
│   │   ├── buildings/    # 楼栋管理
│   │   ├── rooms/        # 房间管理
│   │   ├── students/     # 学生管理
│   │   ├── repairs/      # 维修工单
│   │   └── visits/       # 访客管理
│   ├── router/           # 路由配置
│   │   ├── index.ts      # 路由主文件
│   │   └── guards.ts     # 路由守卫
│   ├── store/            # 状态管理
│   │   ├── modules/      # 状态模块
│   │   └── index.ts      # Store主文件
│   ├── styles/           # 样式文件
│   │   ├── global.css    # 全局样式
│   │   └── variables.css # CSS变量
│   ├── utils/            # 工具函数
│   │   ├── request.ts    # HTTP请求封装
│   │   ├── auth.ts       # 认证工具
│   │   └── helpers.ts    # 辅助函数
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── README.md             # 项目说明
```

### 5.2 核心功能设计

#### 5.2.1 仪表盘设计
- **统计卡片：** 显示楼栋数量、房间数量、学生数量、入住率等关键指标
- **图表展示：** 入住趋势图、维修工单统计图、访客统计图
- **快捷操作：** 常用功能的快速入口
- **最新动态：** 显示最新的工单、访客申请等信息

#### 5.2.2 楼栋管理界面
- **楼栋列表：** 表格形式展示楼栋信息，支持搜索、筛选、排序
- **楼栋详情：** 显示楼栋基本信息、房间分布、入住统计
- **楼栋操作：** 新增、编辑、删除楼栋，查看统计信息
- **房间管理：** 在楼栋详情中管理房间信息

#### 5.2.3 学生住宿管理界面
- **学生列表：** 显示所有学生的住宿信息
- **宿舍分配：** 手动分配和自动分配两种方式
- **分配向导：** 步骤式的宿舍分配流程
- **批量操作：** 支持批量分配、批量退宿等操作

#### 5.2.4 维修工单界面
- **工单列表：** 显示所有维修工单，支持状态筛选
- **工单详情：** 显示工单详细信息、处理进度、留言记录
- **工单处理：** 分配维修人员、更新状态、添加留言
- **统计分析：** 工单统计图表，分析维修趋势

#### 5.2.5 访客管理界面
- **访客列表：** 显示所有访客记录，支持时间筛选
- **访客登记：** 访客信息登记表单
- **审核流程：** 访客申请的审核、通过、拒绝操作
- **访问控制：** 访客进出记录管理

### 5.3 用户体验设计

#### 5.3.1 响应式设计
- **桌面端：** 1920x1080分辨率优化，支持大屏显示
- **平板端：** 768px-1024px适配，触摸操作优化
- **手机端：** 320px-768px适配，移动端交互优化

#### 5.3.2 交互设计
- **加载状态：** 数据加载时显示骨架屏或加载动画
- **错误处理：** 友好的错误提示和重试机制
- **操作反馈：** 操作成功/失败的即时反馈
- **快捷键：** 常用操作的键盘快捷键支持

#### 5.3.3 无障碍设计
- **键盘导航：** 支持Tab键导航
- **屏幕阅读器：** 适配屏幕阅读器
- **颜色对比：** 确保足够的颜色对比度
- **字体大小：** 支持字体大小调整

---

## 6. 测试方案

### 6.1 测试策略

#### 6.1.1 测试类型
- **单元测试：** 测试单个函数或组件的功能
- **集成测试：** 测试模块间的集成和接口
- **端到端测试：** 测试完整的用户操作流程
- **性能测试：** 测试系统的性能和负载能力
- **安全测试：** 测试系统的安全性

#### 6.1.2 测试覆盖率目标
- **代码覆盖率：** ≥ 80%
- **分支覆盖率：** ≥ 75%
- **功能覆盖率：** 100%
- **接口覆盖率：** 100%

### 6.2 测试工具

#### 6.2.1 后端测试工具
- **Go Testing：** Go内置测试框架
- **Testify：** 断言和模拟库
- **GoMock：** 模拟对象生成工具
- **Apache Bench：** 性能测试工具

#### 6.2.2 前端测试工具
- **Vitest：** 单元测试框架
- **Vue Test Utils：** Vue组件测试工具
- **Cypress：** 端到端测试框架
- **Playwright：** 跨浏览器测试工具

### 6.3 测试用例设计

#### 6.3.1 功能测试用例

**用户认证测试：**
- 正确用户名密码登录成功
- 错误用户名密码登录失败
- Token过期自动跳转登录页
- 权限验证正确拦截未授权访问

**楼栋管理测试：**
- 创建楼栋信息完整性验证
- 楼栋名称唯一性验证
- 楼栋信息修改功能验证
- 楼栋删除级联关系验证

**学生住宿测试：**
- 手动分配宿舍功能验证
- 自动分配算法正确性验证
- 床位状态更新正确性验证
- 学生退宿流程完整性验证

#### 6.3.2 性能测试用例

**并发测试：**
- 1000用户同时登录系统
- 500用户同时查询楼栋列表
- 100用户同时创建维修工单
- 50用户同时分配学生宿舍

**负载测试：**
- 持续1小时的正常负载测试
- 逐步增加负载的压力测试
- 峰值负载下的系统稳定性测试
- 长时间运行的稳定性测试

#### 6.3.3 安全测试用例

**认证安全：**
- SQL注入攻击防护测试
- XSS攻击防护测试
- CSRF攻击防护测试
- 暴力破解防护测试

**数据安全：**
- 敏感数据加密存储验证
- 数据传输加密验证
- 权限控制有效性验证
- 数据备份完整性验证

---

## 7. 部署指南

### 7.1 部署环境

#### 7.1.1 硬件要求

| 环境类型 | CPU | 内存 | 存储 | 网络 |
|----------|-----|------|------|------|
| 开发环境 | 2核 | 4GB | 50GB | 100Mbps |
| 测试环境 | 4核 | 8GB | 100GB | 1Gbps |
| 生产环境 | 8核+ | 16GB+ | 500GB+ | 10Gbps |

#### 7.1.2 软件环境

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| 操作系统 | Ubuntu 20.04+ / CentOS 8+ | 服务器操作系统 |
| Docker | 20.10+ | 容器化部署 |
| Docker Compose | 2.0+ | 容器编排 |
| Nginx | 1.18+ | 反向代理和负载均衡 |
| MySQL | 8.0+ | 主数据库 |
| Redis | 6.0+ | 缓存数据库 |

### 7.2 Docker部署

#### 7.2.1 Docker Compose配置

```yaml
version: '3.8'

services:
  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: dormitory-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: dormitory
      MYSQL_USER: dormitory
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - ./data/mysql:/var/lib/mysql
      - ./config/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - dormitory-network

  # Redis缓存
  redis:
    image: redis:6.2-alpine
    container_name: dormitory-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    networks:
      - dormitory-network

  # 后端API服务
  api:
    build:
      context: ./dormitory-api
      dockerfile: Dockerfile
    container_name: dormitory-api
    restart: always
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=dormitory
      - DB_PASSWORD=${MYSQL_PASSWORD}
      - DB_NAME=dormitory
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./logs/api:/app/logs
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
    networks:
      - dormitory-network

  # 前端Web服务
  web:
    build:
      context: ./dormitory-web
      dockerfile: Dockerfile
    container_name: dormitory-web
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./config/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - api
    networks:
      - dormitory-network

networks:
  dormitory-network:
    driver: bridge
```

#### 7.2.2 环境变量配置

```bash
# .env文件
# 数据库配置
MYSQL_ROOT_PASSWORD=your_strong_root_password
MYSQL_PASSWORD=your_strong_password

# Redis配置
REDIS_PASSWORD=your_redis_password

# JWT密钥
JWT_SECRET=your_jwt_secret_key_at_least_32_characters

# 应用配置
APP_ENV=production
APP_DEBUG=false
```

### 7.3 生产环境部署

#### 7.3.1 高可用架构

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │    (HAProxy)    │
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │                 │
            ┌───────▼────────┐ ┌──────▼────────┐
            │   Web Server   │ │  Web Server   │
            │   (Nginx 1)    │ │  (Nginx 2)    │
            └───────┬────────┘ └──────┬────────┘
                    │                 │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │                 │
            ┌───────▼────────┐ ┌──────▼────────┐
            │  API Server    │ │  API Server   │
            │     (Go 1)     │ │     (Go 2)    │
            └───────┬────────┘ └──────┬────────┘
                    │                 │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │                 │
            ┌───────▼────────┐ ┌──────▼────────┐
            │  MySQL Master  │ │ MySQL Slave   │
            │   (Primary)    │ │  (Replica)    │
            └────────────────┘ └───────────────┘
                    │
            ┌───────▼────────┐
            │ Redis Cluster  │
            │   (3 nodes)    │
            └────────────────┘
```

#### 7.3.2 部署步骤

1. **环境准备**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **代码部署**
```bash
# 克隆代码
git clone https://github.com/your-org/dormitory-system.git
cd dormitory-system

# 设置权限
chmod +x run_tests.sh
chmod 600 .env

# 构建并启动服务
docker-compose up -d --build
```

3. **服务验证**
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 健康检查
curl http://localhost:8080/health
curl http://localhost/
```

### 7.4 监控配置

#### 7.4.1 系统监控

**Prometheus配置：**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dormitory-api'
    static_configs:
      - targets: ['api:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql:3306']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

**Grafana仪表盘：**
- 系统资源监控（CPU、内存、磁盘、网络）
- 应用性能监控（响应时间、吞吐量、错误率）
- 数据库监控（连接数、查询性能、慢查询）
- 业务指标监控（用户活跃度、功能使用情况）

#### 7.4.2 日志管理

**ELK Stack配置：**
- **Elasticsearch：** 日志存储和搜索
- **Logstash：** 日志收集和处理
- **Kibana：** 日志可视化和分析

**日志格式标准：**
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "service": "dormitory-api",
  "message": "用户登录成功",
  "user_id": 123,
  "ip": "192.168.1.100",
  "trace_id": "abc123def456"
}
```

---

## 8. 运维监控

### 8.1 监控体系

#### 8.1.1 监控层次

| 监控层次 | 监控内容 | 监控工具 | 告警阈值 |
|----------|----------|----------|----------|
| 基础设施监控 | CPU、内存、磁盘、网络 | Prometheus + Node Exporter | CPU>80%, 内存>85%, 磁盘>90% |
| 应用监控 | 响应时间、吞吐量、错误率 | APM工具 | 响应时间>500ms, 错误率>1% |
| 业务监控 | 用户活跃度、功能使用率 | 自定义指标 | 活跃用户下降>20% |
| 日志监控 | 错误日志、异常日志 | ELK Stack | ERROR级别日志 |

#### 8.1.2 关键指标

**系统性能指标：**
- **响应时间：** API平均响应时间 < 200ms
- **吞吐量：** 每秒处理请求数 > 1000 QPS
- **可用性：** 系统可用性 > 99.9%
- **错误率：** 系统错误率 < 0.1%

**业务指标：**
- **用户活跃度：** 日活跃用户数
- **功能使用率：** 各功能模块使用频率
- **数据增长：** 数据量增长趋势
- **用户满意度：** 用户反馈评分

### 8.2 运维管理

#### 8.2.1 日常运维

**服务管理：**
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart api

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f api
```

**数据备份：**
```bash
#!/bin/bash
# 数据库备份脚本
BACKUP_DIR="/opt/backups/dormitory"
DATE=$(date +%Y%m%d_%H%M%S)

# MySQL备份
docker exec dormitory-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD dormitory > $BACKUP_DIR/mysql_$DATE.sql

# Redis备份
docker exec dormitory-redis redis-cli --rdb /data/dump.rdb
docker cp dormitory-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 清理旧备份（保留7天）
find $BACKUP_DIR -type f -mtime +7 -delete
```

#### 8.2.2 故障处理

**常见故障及解决方案：**

| 故障类型 | 症状 | 可能原因 | 解决方案 |
|----------|------|----------|----------|
| 服务无响应 | 接口超时 | 服务宕机 | 重启服务，检查日志 |
| 数据库连接失败 | 连接超时 | 数据库宕机 | 重启数据库，检查配置 |
| 内存不足 | 系统卡顿 | 内存泄漏 | 重启服务，优化代码 |
| 磁盘空间不足 | 写入失败 | 日志文件过大 | 清理日志，扩容磁盘 |
| 网络异常 | 请求失败 | 网络故障 | 检查网络配置 |

**应急响应流程：**
1. **故障发现：** 监控告警或用户反馈
2. **故障确认：** 确认故障范围和影响
3. **应急处理：** 快速恢复服务
4. **根因分析：** 分析故障原因
5. **预防措施：** 制定预防方案

### 8.3 安全管理

#### 8.3.1 安全加固

**系统安全：**
```bash
# 更新系统
apt update && apt upgrade -y

# 配置防火墙
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# 禁用root登录
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh
```

**应用安全：**
- 定期更新依赖包
- 使用强密码策略
- 启用HTTPS加密
- 配置安全响应头
- 定期安全扫描

#### 8.3.2 数据安全

**数据加密：**
- 数据库连接加密
- 敏感数据字段加密
- 传输数据HTTPS加密
- 备份数据加密存储

**访问控制：**
- 最小权限原则
- 定期权限审计
- 操作日志记录
- 异常访问告警

---

## 9. 总结

### 9.1 项目特色

1. **技术先进性：** 采用现代化技术栈，Vue 3 + Go + MySQL的组合确保了系统的高性能和可维护性
2. **架构合理性：** 前后端分离架构，微服务设计理念，支持水平扩展
3. **功能完整性：** 覆盖宿舍管理的全生命周期，从分配到退宿的完整流程
4. **用户体验：** 响应式设计，支持多端访问，操作简单直观
5. **安全可靠：** 完善的权限控制，数据加密，安全防护机制

### 9.2 技术亮点

1. **智能分配算法：** 基于学生偏好和房间特征的智能宿舍分配
2. **实时数据同步：** 使用WebSocket实现实时数据更新
3. **缓存优化：** Redis缓存提升系统响应速度
4. **容器化部署：** Docker容器化部署，简化运维管理
5. **监控完善：** 全方位监控体系，保障系统稳定运行

### 9.3 扩展规划

1. **移动端应用：** 开发iOS和Android原生应用
2. **微信小程序：** 开发微信小程序版本
3. **人工智能：** 引入AI技术优化分配算法
4. **物联网集成：** 集成智能门锁、环境监测等IoT设备
5. **大数据分析：** 构建数据仓库，进行深度数据分析

### 9.4 维护建议

1. **定期更新：** 及时更新系统依赖和安全补丁
2. **性能优化：** 定期进行性能测试和优化
3. **备份策略：** 制定完善的数据备份和恢复策略
4. **文档维护：** 保持技术文档的及时更新
5. **团队培训：** 定期进行技术培训和知识分享

---

**文档结束**

*本文档为宿舍管理系统的完整技术文档，涵盖了系统设计、开发、测试、部署、运维等各个方面。文档采用Word友好的格式编写，可直接复制到Word文档中使用。如有疑问或需要进一步说明，请联系开发团队。*
