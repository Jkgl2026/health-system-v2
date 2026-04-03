#!/bin/bash

# 健康评估流程测试脚本

echo "=== 开始测试健康评估流程 ==="
echo ""

# 1. 创建测试用户和会话
echo "1. 创建评估会话..."
SESSION_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d '{
  "userId": "test-flow-user-001",
  "sessionName": "流程测试会话",
  "personalInfo": {
    "name": "测试用户",
    "age": 35,
    "gender": "male",
    "height": 175,
    "weight": 70
  }
}' http://localhost:5000/api/assessment/sessions)

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
USER_ID="test-flow-user-001"

echo "会话ID: $SESSION_ID"
echo ""

# 2. 提交健康问卷
echo "2. 提交健康问卷..."
HEALTH_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d "{
  \"userId\": \"$USER_ID\",
  \"sessionId\": \"$SESSION_ID\",
  \"hasHypertension\": false,
  \"hasDiabetes\": false,
  \"hasHyperlipidemia\": false,
  \"exerciseFrequency\": \"每周3-5次\",
  \"sleepQuality\": \"很好\",
  \"sleepHours\": \"7-8小时\",
  \"dietHabits\": \"均衡饮食\",
  \"stressLevel\": \"低\",
  \"familyHypertension\": false,
  \"familyDiabetes\": false,
  \"familyCardiovascular\": false
}" http://localhost:5000/api/health-questionnaire)

echo "健康问卷响应: $HEALTH_RESPONSE"
HEALTH_ID=$(echo $HEALTH_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "健康问卷ID: $HEALTH_ID"
echo ""

# 3. 提交体质问卷
echo "3. 提交体质问卷..."
CONSTITUTION_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d "{
  \"userId\": \"$USER_ID\",
  \"sessionId\": \"$SESSION_ID\",
  \"answers\": {
    \"q1\": 1,
    \"q2\": 1,
    \"q3\": 2
  },
  \"scores\": {
    \"PINGHE\": 55,
    \"QIXU\": 30,
    \"YANGXU\": 25,
    \"YINXU\": 20,
    \"TANSHI\": 25,
    \"SHIRE\": 20,
    \"XUEYU\": 15,
    \"QIXUEBIKU\": 20,
    \"TEZHI\": 10
  },
  \"primaryConstitution\": \"平和质\",
  \"secondaryConstitutions\": [],
  \"isBalanced\": true
}" http://localhost:5000/api/constitution-questionnaire)

echo "体质问卷响应: $CONSTITUTION_RESPONSE"
CONSTITUTION_ID=$(echo $CONSTITUTION_RESPONSE | grep -o '"questionnaireId":"[^"]*' | cut -d'"' -f4)
echo "体质问卷ID: $CONSTITUTION_ID"
echo ""

# 4. 获取健康分析和风险评估（模拟前端分析流程）
echo "4. 执行健康分析..."

# 4.1 计算健康要素
HEALTH_ANALYSIS_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d "{
  \"userId\": \"$USER_ID\",
  \"sessionId\": \"$SESSION_ID\",
  \"qiAndBlood\": 85,
  \"circulation\": 88,
  \"toxins\": 80,
  \"bloodLipids\": 75,
  \"coldness\": 72,
  \"immunity\": 90,
  \"emotions\": 85,
  \"overallHealth\": 82
}" http://localhost:5000/api/health-analysis)

echo "健康分析响应: $HEALTH_ANALYSIS_RESPONSE"
HEALTH_ANALYSIS_ID=$(echo $HEALTH_ANALYSIS_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "健康分析ID: $HEALTH_ANALYSIS_ID"
echo ""

# 4.2 计算风险评估
RISK_ASSESSMENT_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d "{
  \"userId\": \"$USER_ID\",
  \"sessionId\": \"$SESSION_ID\",
  \"overallRiskLevel\": \"low\",
  \"healthScore\": 82,
  \"riskFactors\": {
    \"cardiovascular\": {
      \"level\": \"low\",
      \"description\": \"无明显心血管风险\"
    },
    \"metabolic\": {
      \"level\": \"low\",
      \"description\": \"代谢功能正常\"
    }
  },
  \"recommendations\": [
    \"继续保持健康的生活方式\",
    \"定期进行健康体检\"
  ]
}" http://localhost:5000/api/risk-assessment)

echo "风险评估响应: $RISK_ASSESSMENT_RESPONSE"
RISK_ASSESSMENT_ID=$(echo $RISK_ASSESSMENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "风险评估ID: $RISK_ASSESSMENT_ID"
echo ""

# 5. 更新会话状态
echo "5. 更新会话状态为已完成..."
UPDATE_RESPONSE=$(curl -s -X PUT -H 'Content-Type: application/json' -d "{
  \"status\": \"completed\",
  \"healthAnalysisId\": \"$HEALTH_ANALYSIS_ID\",
  \"riskAssessmentId\": \"$RISK_ASSESSMENT_ID\"
}" http://localhost:5000/api/assessment/sessions/$SESSION_ID)

echo "会话更新响应: $UPDATE_RESPONSE"
echo ""

# 6. 验证最终结果
echo "6. 验证最终会话状态..."
FINAL_SESSION=$(curl -s http://localhost:5000/api/assessment/sessions/$SESSION_ID)
echo "最终会话数据: $FINAL_SESSION"
echo ""

echo "=== 测试完成 ==="
echo ""
echo "测试结果摘要："
echo "- 会话ID: $SESSION_ID"
echo "- 健康问卷ID: $HEALTH_ID"
echo "- 体质问卷ID: $CONSTITUTION_ID"
echo "- 健康分析ID: $HEALTH_ANALYSIS_ID"
echo "- 风险评估ID: $RISK_ASSESSMENT_ID"
echo ""
echo "访问结果页面: http://localhost:5000/health-assessment/result?sessionId=$SESSION_ID&userId=$USER_ID"
