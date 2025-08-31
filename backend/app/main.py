from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()  # .env 파일 로드
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
port = int(os.getenv("FLASK_PORT", 8000))

@app.route("/images", methods=["POST"])
def get_images():
    data = request.get_json()
    query = data.get("keyword", "").strip()
    if not query:
        return jsonify({"error": "검색어를 입력하세요."}), 400

    url = f"https://api.unsplash.com/search/photos?query={query}&per_page=12&client_id={UNSPLASH_ACCESS_KEY}"
    response = requests.get(url)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": data.get("errors", "Unknown error")}), 400

    images = [photo["urls"]["regular"] for photo in data.get("results", [])]
    return jsonify({"images": images[:12]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=True)
