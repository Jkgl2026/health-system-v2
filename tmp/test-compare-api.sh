#!/bin/bash

echo "测试数据对比页面的API调用"
echo "================================"

# 1. 测试获取历史记录
echo -e "\n1. 测试获取历史记录API..."
response1=$(curl -s "http://localhost:5000/api/user/history?phone=13800138000")
echo "响应: $response1"
echo -e "\n状态码: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/user/history?phone=13800138000")"

# 2. 获取用户ID
userId=$(echo $response1 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "\n提取的用户ID: $userId"

# 3. 测试获取用户详情
echo -e "\n2. 测试获取用户详情API..."
response2=$(curl -s "http://localhost:5000/api/admin/users/$userId")
echo "响应: $response2"
echo -e "\n状态码: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/api/admin/users/$userId")"

echo -e "\n================================"
echo "测试完成"
