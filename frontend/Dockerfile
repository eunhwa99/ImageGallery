FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# docker-compose.yml에서 넘어온 ARG를 ENV로 세팅
# ARG REACT_APP_BACKEND_URL
# ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# build 결과 복사
COPY --from=builder /app/build ./build

# 엔트리포인트 복사
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN npm install -g serve

EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["serve", "-s", "build", "-l", "3000"]
