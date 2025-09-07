from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import logging

app = Flask(__name__)
CORS(app)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()  # .env 파일 로드
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
port = int(os.getenv("FLASK_PORT", 8000))

if not UNSPLASH_ACCESS_KEY:
    logger.error("UNSPLASH_ACCESS_KEY가 설정되지 않았습니다!")

@app.route("/images", methods=["POST"])
def get_images():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON 데이터가 필요합니다."}), 400

        query = data.get("keyword", "").strip()
        count = data.get("count", 12)
        page = data.get("page", 1)  # 페이지네이션 지원

        if not query:
            return jsonify({"error": "검색어를 입력하세요."}), 400

        # count 값 검증 (최소 1개, 최대 30개)
        count = max(1, min(count, 30))
        page = max(1, page)

        logger.info(f"검색 요청 - 키워드: {query}, 개수: {count}, 페이지: {page}")

        # Unsplash API 호출
        url = f"https://api.unsplash.com/search/photos"
        params = {
            "query": query,
            "per_page": count,
            "page": page,
            "client_id": UNSPLASH_ACCESS_KEY,
            "orientation": "landscape"  # 가로 이미지 우선
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code == 401:
            logger.error("Unsplash API 키가 유효하지 않습니다.")
            return jsonify({"error": "API 인증 실패"}), 500

        if response.status_code == 403:
            logger.error("Unsplash API 사용량 한도 초과")
            return jsonify({"error": "API 사용량 한도 초과"}), 429

        if response.status_code != 200:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
            logger.error(f"Unsplash API 오류: {response.status_code}, {error_data}")
            return jsonify({"error": error_data.get("errors", ["알 수 없는 오류"])}), 400

        data = response.json()

        # 이미지 URL 추출 및 추가 정보 포함
        images = []
        for photo in data.get("results", []):
            images.append({
                "url": photo["urls"]["regular"],  # 기본 크기
                "small": photo["urls"]["small"],   # 썸네일용
                "full": photo["urls"]["full"],     # 모달용 고화질
                "id": photo["id"],
                "alt_description": photo.get("alt_description", ""),
                "photographer": photo["user"]["name"],
                "photographer_url": photo["user"]["links"]["html"]
            })

        # 응답 데이터
        response_data = {
            "images": images,
            "total": len(images),
            "total_pages": data.get("total_pages", 1),
            "current_page": page,
            "requested_count": count,
            "has_more": page < data.get("total_pages", 1)
        }

        logger.info(f"성공적으로 {len(images)}개 이미지 반환")
        return jsonify(response_data)

    except requests.exceptions.Timeout:
        logger.error("Unsplash API 요청 타임아웃")
        return jsonify({"error": "요청 시간 초과"}), 504
    except requests.exceptions.RequestException as e:
        logger.error(f"API 요청 실패: {str(e)}")
        return jsonify({"error": f"API 요청 실패: {str(e)}"}), 500
    except Exception as e:
        logger.error(f"서버 오류: {str(e)}")
        return jsonify({"error": f"서버 내부 오류"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """헬스체크 엔드포인트"""
    return jsonify({
        "status": "healthy",
        "service": "image-gallery-api",
        "unsplash_key_configured": bool(UNSPLASH_ACCESS_KEY)
    })

@app.route("/", methods=["GET"])
def root():
    """루트 엔드포인트"""
    return jsonify({
        "message": "Image Gallery API",
        "endpoints": {
            "search": "POST /images",
            "health": "GET /health"
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "엔드포인트를 찾을 수 없습니다."}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "서버 내부 오류"}), 500

if __name__ == "__main__":
    if not UNSPLASH_ACCESS_KEY:
        print("❌ 경고: UNSPLASH_ACCESS_KEY가 설정되지 않았습니다!")
        print("💡 .env 파일에 UNSPLASH_ACCESS_KEY=your_key_here 를 추가하세요.")
    else:
        print("✅ Unsplash API 키가 설정되었습니다.")

    print(f"🚀 서버를 포트 {port}에서 시작합니다...")
    app.run(host="0.0.0.0", port=port, debug=True)