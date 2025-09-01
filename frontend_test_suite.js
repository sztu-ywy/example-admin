// 宿舍管理系统前端自动化测试套件
// 使用 Cypress 进行端到端测试

describe('宿舍管理系统前端测试', () => {
  const baseUrl = 'http://localhost:6003'
  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  }

  beforeEach(() => {
    cy.visit(baseUrl)
  })

  // 1. 用户登录测试
  describe('用户认证功能', () => {
    it('应该能够成功登录', () => {
      cy.get('[data-testid="username-input"]').type(adminCredentials.username)
      cy.get('[data-testid="password-input"]').type(adminCredentials.password)
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-avatar"]').should('be.visible')
      cy.contains('欢迎使用宿舍管理系统').should('be.visible')
    })

    it('应该拒绝错误的登录凭据', () => {
      cy.get('[data-testid="username-input"]').type('wronguser')
      cy.get('[data-testid="password-input"]').type('wrongpass')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('.ant-message-error').should('contain', '用户名或密码错误')
    })

    it('应该能够成功登出', () => {
      // 先登录
      cy.login(adminCredentials.username, adminCredentials.password)
      
      // 登出
      cy.get('[data-testid="user-dropdown"]').click()
      cy.get('[data-testid="logout-button"]').click()
      
      cy.url().should('include', '/login')
    })
  })

  // 2. 仪表盘功能测试
  describe('仪表盘功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
    })

    it('应该显示统计卡片', () => {
      cy.get('[data-testid="total-buildings-card"]').should('be.visible')
      cy.get('[data-testid="total-rooms-card"]').should('be.visible')
      cy.get('[data-testid="total-students-card"]').should('be.visible')
      cy.get('[data-testid="occupancy-rate-card"]').should('be.visible')
    })

    it('应该显示图表', () => {
      cy.get('[data-testid="building-chart"]').should('be.visible')
      cy.get('[data-testid="repair-chart"]').should('be.visible')
    })

    it('快捷操作按钮应该可以点击', () => {
      cy.get('[data-testid="quick-action-buildings"]').click()
      cy.url().should('include', '/buildings')
      
      cy.visit('/dashboard')
      cy.get('[data-testid="quick-action-students"]').click()
      cy.url().should('include', '/students')
    })
  })

  // 3. 楼栋管理功能测试
  describe('楼栋管理功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
      cy.visit('/buildings')
    })

    it('应该显示楼栋列表', () => {
      cy.get('[data-testid="buildings-table"]').should('be.visible')
      cy.get('.ant-table-tbody tr').should('have.length.at.least', 1)
    })

    it('应该能够创建新楼栋', () => {
      cy.get('[data-testid="create-building-button"]').click()
      
      cy.get('[data-testid="building-name-input"]').type('测试楼栋')
      cy.get('[data-testid="building-gender-select"]').click()
      cy.get('.ant-select-item').contains('男寝').click()
      cy.get('[data-testid="building-floors-input"]').type('6')
      cy.get('[data-testid="building-description-input"]').type('测试用楼栋')
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '创建成功')
    })

    it('应该能够编辑楼栋', () => {
      cy.get('[data-testid="edit-building-button"]').first().click()
      
      cy.get('[data-testid="building-name-input"]').clear().type('编辑后的楼栋')
      cy.get('[data-testid="submit-button"]').click()
      
      cy.get('.ant-message-success').should('contain', '更新成功')
    })

    it('应该能够查看楼栋统计', () => {
      cy.get('[data-testid="statistics-button"]').first().click()
      
      cy.get('[data-testid="statistics-modal"]').should('be.visible')
      cy.get('[data-testid="total-rooms-stat"]').should('be.visible')
      cy.get('[data-testid="total-beds-stat"]').should('be.visible')
      cy.get('[data-testid="occupancy-rate-stat"]').should('be.visible')
    })
  })

  // 4. 房间管理功能测试
  describe('房间管理功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
      cy.visit('/rooms')
    })

    it('应该显示房间列表', () => {
      cy.get('[data-testid="rooms-table"]').should('be.visible')
    })

    it('应该能够创建新房间', () => {
      cy.get('[data-testid="create-room-button"]').click()
      
      cy.get('[data-testid="room-building-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="room-number-input"]').type('101')
      cy.get('[data-testid="room-type-select"]').click()
      cy.get('.ant-select-item').contains('标准间').click()
      cy.get('[data-testid="room-capacity-input"]').type('4')
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '创建成功')
    })

    it('应该能够查看房间床位', () => {
      cy.get('[data-testid="view-beds-button"]').first().click()
      
      cy.get('[data-testid="beds-modal"]').should('be.visible')
      cy.get('[data-testid="beds-table"]').should('be.visible')
    })

    it('应该能够查看房间学生', () => {
      cy.get('[data-testid="view-students-button"]').first().click()
      
      cy.get('[data-testid="students-modal"]').should('be.visible')
      cy.get('[data-testid="students-table"]').should('be.visible')
    })
  })

  // 5. 学生住宿管理功能测试
  describe('学生住宿管理功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
      cy.visit('/students')
    })

    it('应该显示学生住宿列表', () => {
      cy.get('[data-testid="students-table"]').should('be.visible')
    })

    it('应该能够手动分配宿舍', () => {
      cy.get('[data-testid="assign-dormitory-button"]').click()
      
      cy.get('[data-testid="student-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="building-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="room-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="bed-select"]').click()
      cy.get('.ant-select-item').first().click()
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '分配成功')
    })

    it('应该能够自动分配宿舍', () => {
      cy.get('[data-testid="auto-assign-button"]').click()
      
      cy.get('[data-testid="student-multi-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('.ant-select-item').eq(1).click()
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '自动分配成功')
    })

    it('应该能够查看未分配学生', () => {
      cy.get('[data-testid="unassigned-students-button"]').click()
      
      cy.get('[data-testid="unassigned-modal"]').should('be.visible')
      cy.get('[data-testid="unassigned-table"]').should('be.visible')
    })
  })

  // 6. 维修工单管理功能测试
  describe('维修工单管理功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
      cy.visit('/repairs')
    })

    it('应该显示维修工单列表', () => {
      cy.get('[data-testid="repairs-table"]').should('be.visible')
    })

    it('应该能够创建新工单', () => {
      cy.get('[data-testid="create-repair-button"]').click()
      
      cy.get('[data-testid="repair-title-input"]').type('测试维修工单')
      cy.get('[data-testid="repair-description-input"]').type('水龙头漏水需要维修')
      cy.get('[data-testid="repair-priority-select"]').click()
      cy.get('.ant-select-item').contains('中').click()
      cy.get('[data-testid="repair-building-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="repair-room-select"]').click()
      cy.get('.ant-select-item').first().click()
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '创建成功')
    })

    it('应该能够分配维修人员', () => {
      cy.get('[data-testid="assign-staff-button"]').first().click()
      
      cy.get('[data-testid="staff-select"]').click()
      cy.get('.ant-select-item').first().click()
      cy.get('[data-testid="assign-remark-input"]').type('已分配给维修师傅')
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '分配成功')
    })

    it('应该能够查看工单详情', () => {
      cy.get('[data-testid="view-detail-button"]').first().click()
      
      cy.get('[data-testid="repair-detail-modal"]').should('be.visible')
      cy.get('[data-testid="repair-info"]').should('be.visible')
      cy.get('[data-testid="repair-comments"]').should('be.visible')
    })

    it('应该能够添加工单留言', () => {
      cy.get('[data-testid="view-detail-button"]').first().click()
      
      cy.get('[data-testid="comment-input"]').type('这是一条测试留言')
      cy.get('[data-testid="add-comment-button"]').click()
      
      cy.get('.ant-message-success').should('contain', '留言添加成功')
    })
  })

  // 7. 访客管理功能测试
  describe('访客管理功能', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
      cy.visit('/visits')
    })

    it('应该显示访客列表', () => {
      cy.get('[data-testid="visits-table"]').should('be.visible')
    })

    it('应该能够登记新访客', () => {
      cy.get('[data-testid="register-visit-button"]').click()
      
      cy.get('[data-testid="visitor-name-input"]').type('张父')
      cy.get('[data-testid="visitor-phone-input"]').type('13800138000')
      cy.get('[data-testid="visitor-idcard-input"]').type('110101199001011234')
      cy.get('[data-testid="visitor-relationship-select"]').click()
      cy.get('.ant-select-item').contains('家长').click()
      cy.get('[data-testid="visit-date-picker"]').click()
      cy.get('.ant-picker-today-btn').click()
      cy.get('[data-testid="visit-start-time"]').click()
      cy.get('.ant-time-picker-panel-select').first().find('li').eq(14).click() // 14:00
      cy.get('[data-testid="visit-end-time"]').click()
      cy.get('.ant-time-picker-panel-select').first().find('li').eq(16).click() // 16:00
      cy.get('[data-testid="visit-purpose-input"]').type('看望孩子')
      
      cy.get('[data-testid="submit-button"]').click()
      cy.get('.ant-message-success').should('contain', '登记成功')
    })

    it('应该能够审核访客', () => {
      cy.get('[data-testid="approve-button"]').first().click()
      cy.get('.ant-message-success').should('contain', '审核通过')
    })

    it('应该能够拒绝访客', () => {
      cy.get('[data-testid="reject-button"]').first().click()
      
      cy.get('[data-testid="reject-reason-input"]').type('时间不合适')
      cy.get('[data-testid="confirm-reject-button"]').click()
      
      cy.get('.ant-message-success').should('contain', '已拒绝访问申请')
    })

    it('应该能够查看访客详情', () => {
      cy.get('[data-testid="view-detail-button"]').first().click()
      
      cy.get('[data-testid="visit-detail-modal"]').should('be.visible')
      cy.get('[data-testid="visitor-info"]').should('be.visible')
    })
  })

  // 8. 响应式设计测试
  describe('响应式设计测试', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
    })

    it('应该在移动设备上正常显示', () => {
      cy.viewport('iphone-6')
      cy.visit('/dashboard')
      
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible')
      cy.get('.stats-cards').should('be.visible')
    })

    it('应该在平板设备上正常显示', () => {
      cy.viewport('ipad-2')
      cy.visit('/dashboard')
      
      cy.get('.stats-cards').should('be.visible')
      cy.get('.charts-section').should('be.visible')
    })
  })

  // 9. 权限控制测试
  describe('权限控制测试', () => {
    it('未登录用户应该被重定向到登录页', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('学生用户应该只能访问有限的功能', () => {
      // 使用学生账户登录
      cy.login('student', 'student123')
      
      // 应该能访问学生功能
      cy.visit('/student/repairs/my')
      cy.get('[data-testid="my-repairs"]').should('be.visible')
      
      // 不应该能访问管理员功能
      cy.visit('/admin/buildings')
      cy.get('.ant-result-403').should('be.visible')
    })
  })

  // 10. 性能测试
  describe('性能测试', () => {
    beforeEach(() => {
      cy.login(adminCredentials.username, adminCredentials.password)
    })

    it('页面加载时间应该在合理范围内', () => {
      const start = Date.now()
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000) // 3秒内加载完成
      })
    })

    it('大数据量表格应该能正常渲染', () => {
      cy.visit('/students')
      cy.get('[data-testid="students-table"]').should('be.visible')
      cy.get('.ant-table-tbody tr').should('have.length.at.least', 1)
    })
  })
})

// 自定义命令
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    cy.get('[data-testid="username-input"]').type(username)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// 测试配置
export const testConfig = {
  baseUrl: 'http://localhost:6003',
  apiUrl: 'http://localhost:8080',
  defaultTimeout: 10000,
  requestTimeout: 30000,
  responseTimeout: 30000,
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false
}
