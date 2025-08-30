# Python 3.11 사용
FROM python:3.11-slim

WORKDIR /app

# 필요 라이브러리 설치
COPY app/ .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY . .

# Flask 서버 실행
EXPOSE 5000
CMD ["python", "main.py"]
