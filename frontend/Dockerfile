FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# React 앱 빌드
RUN npm run build
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
