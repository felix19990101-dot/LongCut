#!/bin/bash

echo "======================================"
echo " YouTube 视频分析工具 - 启动本地服务器"
echo "======================================"
echo ""
echo "正在启动本地 HTTP 服务器..."
echo "请勿关闭此窗口！"
echo ""
echo "在浏览器中访问: http://localhost:8000"
echo "按 Ctrl+C 可以停止服务器"
echo ""
echo "======================================"

# 尝试使用 python3，如果不存在则使用 python
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
else
    python -m http.server 8000
fi
