FROM node:20-alpine

WORKDIR /app

ENV REACT_APP_BACKEND_URL=http://backend-my-backend:8000

COPY package*.json ./
RUN npm install

COPY . .

# 빌드
RUN npm run build

# serve 패키지 설치 후 배포
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
