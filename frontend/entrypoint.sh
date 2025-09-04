#!/bin/sh

# 환경변수로 runtime config 생성
ENV_FILE=/app/build/env-config.js

echo "window._env_ = {" > $ENV_FILE
echo "  REACT_APP_BACKEND_URL: '${REACT_APP_BACKEND_URL}'" >> $ENV_FILE
echo "}" >> $ENV_FILE

exec "$@"
