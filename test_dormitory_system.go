package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"
)

// 测试配置
const (
	BaseURL = "http://localhost:8080"
	AdminUsername = "admin"
	AdminPassword = "admin123"
)

// 测试数据结构
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID    int    `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
		Role  string `json:"role"`
	} `json:"user"`
}

type BuildingRequest struct {
	Name         string `json:"name"`
	GenderType   string `json:"genderType"`
	TotalFloors  int    `json:"totalFloors"`
	Description  string `json:"description"`
}

type RoomRequest struct {
	BuildingID int    `json:"buildingId"`
	RoomNumber string `json:"roomNumber"`
	Type       string `json:"type"`
	Capacity   int    `json:"capacity"`
	Available  bool   `json:"available"`
}

type StudentAssignRequest struct {
	UserID int `json:"userId"`
	BedID  int `json:"bedId"`
}

type RepairRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	RoomID      int    `json:"roomId"`
}

type VisitRequest struct {
	VisitorName     string `json:"visitorName"`
	VisitorPhone    string `json:"visitorPhone"`
	VisitorIdCard   string `json:"visitorIdCard"`
	Relationship    string `json:"relationship"`
	VisitDate       string `json:"visitDate"`
	VisitStartTime  string `json:"visitStartTime"`
	VisitEndTime    string `json:"visitEndTime"`
	Purpose         string `json:"purpose"`
	StudentID       int    `json:"studentId"`
}

// HTTP客户端
var client = &http.Client{Timeout: 30 * time.Second}
var authToken string

// 辅助函数
func makeRequest(method, url string, body interface{}, token string) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, BaseURL+url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	return client.Do(req)
}

func parseResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(body, target)
}

// 测试函数

// 1. 用户认证测试
func TestUserAuthentication(t *testing.T) {
	fmt.Println("=== 测试用户认证 ===")
	
	// 测试登录
	loginReq := LoginRequest{
		Email:    AdminUsername,
		Password: AdminPassword,
	}
	
	resp, err := makeRequest("POST", "/admin/login", loginReq, "")
	if err != nil {
		t.Fatalf("登录请求失败: %v", err)
	}
	
	if resp.StatusCode != 200 {
		t.Fatalf("登录失败，状态码: %d", resp.StatusCode)
	}
	
	var loginResp LoginResponse
	if err := parseResponse(resp, &loginResp); err != nil {
		t.Fatalf("解析登录响应失败: %v", err)
	}
	
	authToken = loginResp.Token
	fmt.Printf("✓ 登录成功，用户: %s, 角色: %s\n", loginResp.User.Name, loginResp.User.Role)
}

// 2. 楼栋管理测试
func TestBuildingManagement(t *testing.T) {
	fmt.Println("\n=== 测试楼栋管理 ===")
	
	// 创建楼栋
	buildingReq := BuildingRequest{
		Name:        "测试楼栋A",
		GenderType:  "M",
		TotalFloors: 6,
		Description: "男生宿舍楼，用于测试",
	}
	
	resp, err := makeRequest("POST", "/admin/buildings", buildingReq, authToken)
	if err != nil {
		t.Fatalf("创建楼栋失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 楼栋创建成功")
	} else {
		fmt.Printf("✗ 楼栋创建失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 获取楼栋列表
	resp, err = makeRequest("GET", "/admin/buildings", nil, authToken)
	if err != nil {
		t.Fatalf("获取楼栋列表失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 楼栋列表获取成功")
	} else {
		fmt.Printf("✗ 楼栋列表获取失败，状态码: %d\n", resp.StatusCode)
	}
}

// 3. 房间管理测试
func TestRoomManagement(t *testing.T) {
	fmt.Println("\n=== 测试房间管理 ===")
	
	// 创建房间
	roomReq := RoomRequest{
		BuildingID: 1, // 假设楼栋ID为1
		RoomNumber: "101",
		Type:       "STANDARD",
		Capacity:   4,
		Available:  true,
	}
	
	resp, err := makeRequest("POST", "/admin/rooms", roomReq, authToken)
	if err != nil {
		t.Fatalf("创建房间失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 房间创建成功")
	} else {
		fmt.Printf("✗ 房间创建失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 获取房间列表
	resp, err = makeRequest("GET", "/admin/rooms", nil, authToken)
	if err != nil {
		t.Fatalf("获取房间列表失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 房间列表获取成功")
	} else {
		fmt.Printf("✗ 房间列表获取失败，状态码: %d\n", resp.StatusCode)
	}
}

// 4. 学生住宿管理测试
func TestStudentAccommodation(t *testing.T) {
	fmt.Println("\n=== 测试学生住宿管理 ===")
	
	// 获取未分配学生列表
	resp, err := makeRequest("GET", "/admin/students/unassigned", nil, authToken)
	if err != nil {
		t.Fatalf("获取未分配学生失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 未分配学生列表获取成功")
	} else {
		fmt.Printf("✗ 未分配学生列表获取失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 分配宿舍
	assignReq := StudentAssignRequest{
		UserID: 2, // 假设学生用户ID为2
		BedID:  1, // 假设床位ID为1
	}
	
	resp, err = makeRequest("POST", "/admin/students", assignReq, authToken)
	if err != nil {
		t.Fatalf("分配宿舍失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 宿舍分配成功")
	} else {
		fmt.Printf("✗ 宿舍分配失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 自动分配测试
	autoAssignReq := map[string]interface{}{
		"studentIds": []int{3, 4, 5},
		"preferences": map[string]interface{}{
			"buildingId": 1,
			"roomType":   "STANDARD",
		},
	}
	
	resp, err = makeRequest("POST", "/admin/students/auto-assign", autoAssignReq, authToken)
	if err != nil {
		t.Fatalf("自动分配失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 自动分配成功")
	} else {
		fmt.Printf("✗ 自动分配失败，状态码: %d\n", resp.StatusCode)
	}
}

// 5. 维修工单测试
func TestRepairManagement(t *testing.T) {
	fmt.Println("\n=== 测试维修工单管理 ===")
	
	// 创建维修工单
	repairReq := RepairRequest{
		Title:       "测试维修工单",
		Description: "水龙头漏水，需要维修",
		Priority:    "MEDIUM",
		RoomID:      1,
	}
	
	resp, err := makeRequest("POST", "/admin/repairs", repairReq, authToken)
	if err != nil {
		t.Fatalf("创建维修工单失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 维修工单创建成功")
	} else {
		fmt.Printf("✗ 维修工单创建失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 获取待处理工单
	resp, err = makeRequest("GET", "/admin/repairs/pending", nil, authToken)
	if err != nil {
		t.Fatalf("获取待处理工单失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 待处理工单获取成功")
	} else {
		fmt.Printf("✗ 待处理工单获取失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 分配维修人员
	assignReq := map[string]interface{}{
		"staffId": 3, // 假设维修人员ID为3
		"remark":  "已分配给维修师傅A",
	}
	
	resp, err = makeRequest("PUT", "/admin/repairs/1/assign", assignReq, authToken)
	if err != nil {
		t.Fatalf("分配维修人员失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 维修人员分配成功")
	} else {
		fmt.Printf("✗ 维修人员分配失败，状态码: %d\n", resp.StatusCode)
	}
}

// 6. 访客管理测试
func TestVisitManagement(t *testing.T) {
	fmt.Println("\n=== 测试访客管理 ===")
	
	// 登记访客
	visitReq := VisitRequest{
		VisitorName:    "张父",
		VisitorPhone:   "13800138000",
		VisitorIdCard:  "110101199001011234",
		Relationship:   "PARENT",
		VisitDate:      "2024-02-01",
		VisitStartTime: "14:00",
		VisitEndTime:   "16:00",
		Purpose:        "看望孩子，了解学习生活情况",
		StudentID:      2,
	}
	
	resp, err := makeRequest("POST", "/admin/visits", visitReq, authToken)
	if err != nil {
		t.Fatalf("登记访客失败: %v", err)
	}
	
	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		fmt.Println("✓ 访客登记成功")
	} else {
		fmt.Printf("✗ 访客登记失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 获取待审核访客
	resp, err = makeRequest("GET", "/admin/visits/pending", nil, authToken)
	if err != nil {
		t.Fatalf("获取待审核访客失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 待审核访客获取成功")
	} else {
		fmt.Printf("✗ 待审核访客获取失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 审核通过
	resp, err = makeRequest("PUT", "/admin/visits/1/approve", nil, authToken)
	if err != nil {
		t.Fatalf("审核访客失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 访客审核通过")
	} else {
		fmt.Printf("✗ 访客审核失败，状态码: %d\n", resp.StatusCode)
	}
}

// 7. 统计数据测试
func TestStatistics(t *testing.T) {
	fmt.Println("\n=== 测试统计数据 ===")
	
	// 获取仪表盘统计
	resp, err := makeRequest("GET", "/admin/statistics/dashboard", nil, authToken)
	if err != nil {
		t.Fatalf("获取仪表盘统计失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 仪表盘统计获取成功")
	} else {
		fmt.Printf("✗ 仪表盘统计获取失败，状态码: %d\n", resp.StatusCode)
	}
	
	// 获取楼栋统计
	resp, err = makeRequest("GET", "/admin/buildings/1/statistics", nil, authToken)
	if err != nil {
		t.Fatalf("获取楼栋统计失败: %v", err)
	}
	
	if resp.StatusCode == 200 {
		fmt.Println("✓ 楼栋统计获取成功")
	} else {
		fmt.Printf("✗ 楼栋统计获取失败，状态码: %d\n", resp.StatusCode)
	}
}

// 主测试函数
func main() {
	fmt.Println("🏠 宿舍管理系统API测试开始")
	fmt.Println("测试服务器地址:", BaseURL)
	fmt.Println("测试时间:", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Println(strings.Repeat("=", 50))
	
	// 按顺序执行测试
	t := &testing.T{}
	
	TestUserAuthentication(t)
	TestBuildingManagement(t)
	TestRoomManagement(t)
	TestStudentAccommodation(t)
	TestRepairManagement(t)
	TestVisitManagement(t)
	TestStatistics(t)
	
	fmt.Println(strings.Repeat("=", 50))
	fmt.Println("🎉 所有测试完成！")
}
