// 维修工单API测试脚本
// 使用方法：在浏览器控制台中运行此脚本

class RepairAPITester {
  constructor() {
    this.baseURL = window.location.origin + '/admin';
    this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // 获取请求头
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // 通用请求方法
  async request(method, url, data = null) {
    const config = {
      method,
      headers: this.getHeaders(),
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log(`🚀 ${method} ${url}`, data);
      const response = await fetch(url, config);
      const result = await response.json();
      
      if (!response.ok) {
        console.error(`❌ ${method} ${url} 失败:`, result);
        return { success: false, error: result, status: response.status };
      }
      
      console.log(`✅ ${method} ${url} 成功:`, result);
      return { success: true, data: result, status: response.status };
    } catch (error) {
      console.error(`💥 ${method} ${url} 异常:`, error);
      return { success: false, error: error.message, status: 0 };
    }
  }

  // 测试获取当前用户信息
  async testCurrentUser() {
    console.log('\n=== 测试获取当前用户信息 ===');
    return await this.request('GET', `${this.baseURL}/user`);
  }

  // 测试获取楼栋列表
  async testGetBuildings() {
    console.log('\n=== 测试获取楼栋列表 ===');
    return await this.request('GET', `${this.baseURL}/buildings`);
  }

  // 测试获取房间列表
  async testGetRooms(buildingId = 1) {
    console.log('\n=== 测试获取房间列表 ===');
    return await this.request('GET', `${this.baseURL}/rooms?building_id=${buildingId}`);
  }

  // 测试获取维修工单列表
  async testGetRepairs() {
    console.log('\n=== 测试获取维修工单列表 ===');
    return await this.request('GET', `${this.baseURL}/repairs`);
  }

  // 测试创建维修工单
  async testCreateRepair(repairData = null) {
    console.log('\n=== 测试创建维修工单 ===');
    
    const defaultData = {
      title: '测试维修工单 - ' + new Date().toLocaleString(),
      description: '这是一个API测试工单，用于验证前后端接口是否正常工作。',
      priority: 'MEDIUM',
      room_id: 1, // 注意：使用snake_case
    };

    const data = repairData || defaultData;
    return await this.request('POST', `${this.baseURL}/repairs`, data);
  }

  // 测试更新维修工单
  async testUpdateRepair(repairId, updateData = null) {
    console.log('\n=== 测试更新维修工单 ===');
    
    const defaultData = {
      title: '更新的测试维修工单 - ' + new Date().toLocaleString(),
      description: '这是一个更新后的API测试工单。',
      priority: 'HIGH',
    };

    const data = updateData || defaultData;
    return await this.request('PUT', `${this.baseURL}/repairs/${repairId}`, data);
  }

  // 测试分配维修人员
  async testAssignRepair(repairId, staffId = 1) {
    console.log('\n=== 测试分配维修人员 ===');
    
    const data = {
      staff_id: staffId,
      remark: '测试分配维修人员'
    };

    return await this.request('PUT', `${this.baseURL}/repairs/${repairId}/assign`, data);
  }

  // 测试更新工单状态
  async testUpdateStatus(repairId, status = 'PROCESSING') {
    console.log('\n=== 测试更新工单状态 ===');
    
    const data = {
      status: status,
      remark: '测试状态更新'
    };

    return await this.request('PUT', `${this.baseURL}/repairs/${repairId}/status`, data);
  }

  // 测试添加工单留言
  async testAddComment(repairId, content = null) {
    console.log('\n=== 测试添加工单留言 ===');
    
    const data = {
      content: content || '这是一条测试留言 - ' + new Date().toLocaleString()
    };

    return await this.request('POST', `${this.baseURL}/repairs/${repairId}/comments`, data);
  }

  // 测试删除维修工单
  async testDeleteRepair(repairId) {
    console.log('\n=== 测试删除维修工单 ===');
    return await this.request('DELETE', `${this.baseURL}/repairs/${repairId}`);
  }

  // 运行完整测试套件
  async runFullTest() {
    console.log('🧪 开始运行维修工单API完整测试...\n');
    
    const results = {};

    // 1. 测试用户信息
    results.currentUser = await this.testCurrentUser();
    
    // 2. 测试基础数据
    results.buildings = await this.testGetBuildings();
    results.rooms = await this.testGetRooms();
    
    // 3. 测试工单列表
    results.repairsList = await this.testGetRepairs();
    
    // 4. 测试创建工单
    results.createRepair = await this.testCreateRepair();
    
    if (results.createRepair.success && results.createRepair.data.id) {
      const repairId = results.createRepair.data.id;
      
      // 5. 测试更新工单
      results.updateRepair = await this.testUpdateRepair(repairId);
      
      // 6. 测试添加留言
      results.addComment = await this.testAddComment(repairId);
      
      // 7. 测试分配维修人员（如果有维修人员的话）
      // results.assignRepair = await this.testAssignRepair(repairId);
      
      // 8. 测试更新状态
      // results.updateStatus = await this.testUpdateStatus(repairId);
      
      // 9. 最后删除测试工单
      results.deleteRepair = await this.testDeleteRepair(repairId);
    }

    // 输出测试结果摘要
    console.log('\n📊 测试结果摘要:');
    Object.entries(results).forEach(([test, result]) => {
      const status = result.success ? '✅' : '❌';
      const statusText = result.success ? '成功' : `失败(${result.status})`;
      console.log(`${status} ${test}: ${statusText}`);
      if (!result.success) {
        console.log(`   错误: ${result.error.message || JSON.stringify(result.error)}`);
      }
    });

    return results;
  }

  // 快速测试创建工单
  async quickCreateTest() {
    console.log('🚀 快速测试创建维修工单...\n');
    
    const userResult = await this.testCurrentUser();
    if (!userResult.success) {
      console.error('❌ 用户认证失败，请先登录');
      return;
    }

    console.log('👤 当前用户:', userResult.data);
    
    const createResult = await this.testCreateRepair();
    
    if (createResult.success) {
      console.log('🎉 维修工单创建成功！');
      console.log('📝 工单信息:', createResult.data);
    } else {
      console.log('💥 维修工单创建失败！');
      console.log('🔍 错误详情:', createResult.error);
      
      // 分析常见错误
      if (createResult.status === 403) {
        console.log('💡 可能的原因：');
        console.log('   1. 当前用户角色不是STUDENT，但后端限制只有学生可以创建工单');
        console.log('   2. 用户没有住宿安排');
        console.log('   3. 权限不足');
      } else if (createResult.status === 401) {
        console.log('💡 可能的原因：');
        console.log('   1. Token已过期，请重新登录');
        console.log('   2. Token无效');
      } else if (createResult.status === 400) {
        console.log('💡 可能的原因：');
        console.log('   1. 请求参数格式错误');
        console.log('   2. 必填字段缺失');
        console.log('   3. 数据验证失败');
      }
    }

    return createResult;
  }
}

// 创建测试实例
window.repairTester = new RepairAPITester();

console.log('🔧 维修工单API测试工具已加载！');
console.log('📖 使用方法：');
console.log('   repairTester.quickCreateTest()     - 快速测试创建工单');
console.log('   repairTester.runFullTest()         - 运行完整测试套件');
console.log('   repairTester.testCurrentUser()     - 测试获取当前用户');
console.log('   repairTester.testGetRepairs()      - 测试获取工单列表');
console.log('   repairTester.testCreateRepair()    - 测试创建工单');
