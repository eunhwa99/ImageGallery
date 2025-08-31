#!/bin/sh
# Helm values.yaml에서 주입한 URL로 JS 치환
sed -i "s|REACT_APP_BACKEND_URL_PLACEHOLDER|$REACT_APP_BACKEND_URL|g" /app/build/static/js/*.js

# React 앱 실행
serve -s build -l 3000
