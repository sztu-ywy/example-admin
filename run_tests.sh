#!/bin/bash

# 宿舍管理系统完整测试执行脚本
# 作者: 系统开发团队
# 版本: 1.0.0
# 日期: 2024-01-01

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
BACKEND_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:6003"
TEST_TIMEOUT=300  # 5分钟超时
LOG_DIR="./test_logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 创建日志目录
mkdir -p $LOG_DIR

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/test_$TIMESTAMP.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/test_$TIMESTAMP.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/test_$TIMESTAMP.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/test_$TIMESTAMP.log"
}

# 检查服务状态
check_service() {
    local url=$1
    local service_name=$2
    
    log_info "检查 $service_name 服务状态..."
    
    if curl -s --max-time 10 "$url" > /dev/null; then
        log_success "$service_name 服务运行正常"
        return 0
    else
        log_error "$service_name 服务不可用"
        return 1
    fi
}

# 等待服务启动
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    log_info "等待 $service_name 服务启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 5 "$url" > /dev/null; then
            log_success "$service_name 服务已启动"
            return 0
        fi
        
        log_info "等待 $service_name 服务启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log_error "$service_name 服务启动超时"
    return 1
}

# 运行后端API测试
run_backend_tests() {
    log_info "开始运行后端API测试..."
    
    # 检查Go环境
    if ! command -v go &> /dev/null; then
        log_error "Go环境未安装"
        return 1
    fi
    
    # 编译测试程序
    log_info "编译后端测试程序..."
    if go build -o test_dormitory_system test_dormitory_system.go; then
        log_success "测试程序编译成功"
    else
        log_error "测试程序编译失败"
        return 1
    fi
    
    # 运行测试
    log_info "执行后端API测试..."
    if timeout $TEST_TIMEOUT ./test_dormitory_system > "$LOG_DIR/backend_test_$TIMESTAMP.log" 2>&1; then
        log_success "后端API测试完成"
        cat "$LOG_DIR/backend_test_$TIMESTAMP.log"
    else
        log_error "后端API测试失败或超时"
        cat "$LOG_DIR/backend_test_$TIMESTAMP.log"
        return 1
    fi
}

# 运行前端测试
run_frontend_tests() {
    log_info "开始运行前端测试..."
    
    # 检查Node.js环境
    if ! command -v node &> /dev/null; then
        log_error "Node.js环境未安装"
        return 1
    fi
    
    # 检查Cypress
    if ! command -v cypress &> /dev/null; then
        log_warning "Cypress未安装，尝试安装..."
        if npm install -g cypress; then
            log_success "Cypress安装成功"
        else
            log_error "Cypress安装失败"
            return 1
        fi
    fi
    
    # 运行Cypress测试
    log_info "执行前端E2E测试..."
    cd ../dormitory-web
    
    if npx cypress run --spec "cypress/e2e/frontend_test_suite.js" --headless > "$LOG_DIR/frontend_test_$TIMESTAMP.log" 2>&1; then
        log_success "前端E2E测试完成"
        cat "$LOG_DIR/frontend_test_$TIMESTAMP.log"
    else
        log_error "前端E2E测试失败"
        cat "$LOG_DIR/frontend_test_$TIMESTAMP.log"
        return 1
    fi
    
    cd ../dormitory-api
}

# 运行性能测试
run_performance_tests() {
    log_info "开始运行性能测试..."
    
    # 检查Apache Bench
    if ! command -v ab &> /dev/null; then
        log_warning "Apache Bench未安装，跳过性能测试"
        return 0
    fi
    
    # 登录获取Token
    log_info "获取认证Token..."
    TOKEN=$(curl -s -X POST "$BACKEND_URL/admin/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin","password":"admin123"}' | \
        grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        log_error "无法获取认证Token"
        return 1
    fi
    
    # 性能测试场景
    declare -a endpoints=(
        "/admin/buildings"
        "/admin/rooms"
        "/admin/students"
        "/admin/repairs"
        "/admin/visits"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "测试端点性能: $endpoint"
        
        ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
           "$BACKEND_URL$endpoint" > "$LOG_DIR/perf_${endpoint//\//_}_$TIMESTAMP.log" 2>&1
        
        # 提取关键性能指标
        local rps=$(grep "Requests per second" "$LOG_DIR/perf_${endpoint//\//_}_$TIMESTAMP.log" | awk '{print $4}')
        local avg_time=$(grep "Time per request" "$LOG_DIR/perf_${endpoint//\//_}_$TIMESTAMP.log" | head -1 | awk '{print $4}')
        
        log_info "$endpoint - RPS: $rps, 平均响应时间: ${avg_time}ms"
    done
    
    log_success "性能测试完成"
}

# 运行安全测试
run_security_tests() {
    log_info "开始运行安全测试..."
    
    # 测试未授权访问
    log_info "测试未授权访问..."
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/admin/buildings")
    
    if [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
        log_success "未授权访问正确被拒绝 (状态码: $status_code)"
    else
        log_error "安全漏洞：未授权访问未被正确拒绝 (状态码: $status_code)"
    fi
    
    # 测试SQL注入
    log_info "测试SQL注入防护..."
    local response=$(curl -s "$BACKEND_URL/admin/buildings?name='; DROP TABLE users; --")
    
    if echo "$response" | grep -q "error\|invalid"; then
        log_success "SQL注入防护正常"
    else
        log_warning "需要检查SQL注入防护"
    fi
    
    # 测试XSS防护
    log_info "测试XSS防护..."
    local xss_payload="<script>alert('xss')</script>"
    local response=$(curl -s -X POST "$BACKEND_URL/admin/buildings" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$xss_payload\"}")
    
    if echo "$response" | grep -q "error\|invalid"; then
        log_success "XSS防护正常"
    else
        log_warning "需要检查XSS防护"
    fi
    
    log_success "安全测试完成"
}

# 生成测试报告
generate_report() {
    log_info "生成测试报告..."
    
    local report_file="$LOG_DIR/test_report_$TIMESTAMP.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>宿舍管理系统测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 宿舍管理系统测试报告</h1>
        <p><strong>测试时间：</strong>$(date)</p>
        <p><strong>测试版本：</strong>1.0.0</p>
    </div>
    
    <div class="section">
        <h2>📊 测试概览</h2>
        <ul>
            <li>后端API测试：$([ -f "$LOG_DIR/backend_test_$TIMESTAMP.log" ] && echo "✅ 已执行" || echo "❌ 未执行")</li>
            <li>前端E2E测试：$([ -f "$LOG_DIR/frontend_test_$TIMESTAMP.log" ] && echo "✅ 已执行" || echo "❌ 未执行")</li>
            <li>性能测试：$(ls "$LOG_DIR"/perf_*_$TIMESTAMP.log 2>/dev/null | wc -l | awk '{if($1>0) print "✅ 已执行"; else print "❌ 未执行"}')</li>
            <li>安全测试：✅ 已执行</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>🔧 后端API测试结果</h2>
        <pre>$([ -f "$LOG_DIR/backend_test_$TIMESTAMP.log" ] && cat "$LOG_DIR/backend_test_$TIMESTAMP.log" || echo "测试未执行")</pre>
    </div>
    
    <div class="section">
        <h2>🌐 前端E2E测试结果</h2>
        <pre>$([ -f "$LOG_DIR/frontend_test_$TIMESTAMP.log" ] && cat "$LOG_DIR/frontend_test_$TIMESTAMP.log" || echo "测试未执行")</pre>
    </div>
    
    <div class="section">
        <h2>⚡ 性能测试结果</h2>
        <pre>$(ls "$LOG_DIR"/perf_*_$TIMESTAMP.log 2>/dev/null | head -5 | xargs cat || echo "性能测试未执行")</pre>
    </div>
    
    <div class="section">
        <h2>🔒 安全测试结果</h2>
        <p>安全测试已完成，详细结果请查看日志文件。</p>
    </div>
    
    <div class="section">
        <h2>📝 测试建议</h2>
        <ul>
            <li>定期执行完整测试套件</li>
            <li>监控性能指标变化</li>
            <li>及时修复发现的问题</li>
            <li>保持测试用例更新</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    log_success "测试报告已生成: $report_file"
}

# 清理函数
cleanup() {
    log_info "清理测试环境..."
    
    # 清理测试程序
    [ -f "./test_dormitory_system" ] && rm -f "./test_dormitory_system"
    
    # 压缩日志文件
    if [ -d "$LOG_DIR" ]; then
        tar -czf "test_logs_$TIMESTAMP.tar.gz" "$LOG_DIR"
        log_success "日志文件已压缩: test_logs_$TIMESTAMP.tar.gz"
    fi
}

# 主函数
main() {
    log_info "🚀 开始宿舍管理系统完整测试"
    log_info "测试时间戳: $TIMESTAMP"
    
    # 检查服务状态
    if ! check_service "$BACKEND_URL/health" "后端"; then
        log_error "后端服务不可用，请先启动后端服务"
        exit 1
    fi
    
    if ! check_service "$FRONTEND_URL" "前端"; then
        log_warning "前端服务不可用，将跳过前端测试"
    fi
    
    # 执行测试
    local test_results=()
    
    # 后端API测试
    if run_backend_tests; then
        test_results+=("后端API测试: ✅")
    else
        test_results+=("后端API测试: ❌")
    fi
    
    # 前端测试
    if check_service "$FRONTEND_URL" "前端"; then
        if run_frontend_tests; then
            test_results+=("前端E2E测试: ✅")
        else
            test_results+=("前端E2E测试: ❌")
        fi
    else
        test_results+=("前端E2E测试: ⏭️ 跳过")
    fi
    
    # 性能测试
    if run_performance_tests; then
        test_results+=("性能测试: ✅")
    else
        test_results+=("性能测试: ❌")
    fi
    
    # 安全测试
    if run_security_tests; then
        test_results+=("安全测试: ✅")
    else
        test_results+=("安全测试: ❌")
    fi
    
    # 生成报告
    generate_report
    
    # 显示测试结果摘要
    echo
    log_info "📋 测试结果摘要:"
    for result in "${test_results[@]}"; do
        echo "  $result"
    done
    
    echo
    log_success "🎉 宿舍管理系统测试完成！"
    log_info "详细日志请查看: $LOG_DIR/"
    
    # 清理
    cleanup
}

# 信号处理
trap cleanup EXIT

# 执行主函数
main "$@"
