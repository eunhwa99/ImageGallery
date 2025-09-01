# Python 3.11 사용
FROM python:3.11-slim

WORKDIR /app

ENV FLASK_PORT=8000

# requirements 복사 & 설치
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY app/ .

# Flask 서버 실행
EXPOSE 8000
CMD ["python", "main.py"]
