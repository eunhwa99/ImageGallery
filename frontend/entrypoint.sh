#!/bin/sh

echo "Replacing placeholder with $REACT_APP_BACKEND_URL"
# 빌드된 JS나 index.html 파일을 정확히 치환
sed -i "s|REACT_APP_BACKEND_URL_PLACEHOLDER|$REACT_APP_BACKEND_URL|g" /app/build/index.html

# React 앱 실행
serve -s build -l 3000
