#!/bin/bash

# 测试完整流程脚本

API_BASE="http://localhost:5000/api"

echo "========================================="
echo "测试完整流程"
echo "========================================="
echo ""

# 步骤 1: 创建用户
echo "步骤 1: 创建用户"
USER_RESPONSE=$(curl -s -X POST "${API_BASE}/user" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "phone": "13900000001",
    "age": 30,
    "gender": "男",
    "weight": "70",
    "height": "175",
    "bloodPressure": "120/80",
    "occupation": "工程师",
    "address": "北京市朝阳区",
    "bmi": "22.9"
  }')
echo "$USER_RESPONSE" | python3 -m json.tool

# 提取用户ID
USER_ID=$(echo "$USER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['id'])")
echo "用户ID: $USER_ID"
echo ""

# 步骤 2: 保存症状自检
echo "步骤 2: 保存症状自检"
SYMPTOM_RESPONSE=$(curl -s -X POST "${API_BASE}/symptom-check" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"checkedSymptoms\": [\"1\", \"2\", \"3\", \"4\", \"5\"],
    \"totalScore\": 5,
    \"elementScores\": {\"气血\": 2, \"循环\": 1, \"毒素\": 2}
  }")
echo "$SYMPTOM_RESPONSE" | python3 -m json.tool
echo ""

# 步骤 3: 保存健康要素分析
echo "步骤 3: 保存健康要素分析"
ANALYSIS_RESPONSE=$(curl -s -X POST "${API_BASE}/health-analysis" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"qiAndBlood\": 2,
    \"circulation\": 1,
    \"toxins\": 2,
    \"bloodLipids\": 0,
    \"coldness\": 0,
    \"immunity\": 0,
    \"emotions\": 0,
    \"overallHealth\": 5
  }")
echo "$ANALYSIS_RESPONSE" | python3 -m json.tool
echo ""

# 步骤 4: 保存用户选择
echo "步骤 4: 保存用户选择"
CHOICE_RESPONSE=$(curl -s -X POST "${API_BASE}/user-choice" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"planType\": \"系统调理\",
    \"planDescription\": \"按照系统调理方案进行健康管理\"
  }")
echo "$CHOICE_RESPONSE" | python3 -m json.tool
echo ""

# 步骤 5: 保存四个要求
echo "步骤 5: 保存四个要求"
REQUIREMENTS_RESPONSE=$(curl -s -X POST "${API_BASE}/requirements" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"requirement1Completed\": true,
    \"requirement2Completed\": true,
    \"requirement3Completed\": true,
    \"requirement4Completed\": true
  }")
echo "$REQUIREMENTS_RESPONSE" | python3 -m json.tool
echo ""

# 步骤 6: 查询用户完整信息
echo "步骤 6: 查询用户完整信息（管理后台API）"
FULL_DATA_RESPONSE=$(curl -s "${API_BASE}/admin/users?page=1&limit=10")
echo "$FULL_DATA_RESPONSE" | python3 -m json.tool
echo ""

echo "========================================="
echo "测试完成"
echo "========================================="
