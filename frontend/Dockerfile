FROM node:20-alpine
WORKDIR /app

# 1. 의존성만 먼저 복사 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --only=production

# 2. 소스코드 복사
COPY . .

# 3. 환경변수 빌드 시점에 설정
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]