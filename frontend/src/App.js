import React, { useState } from "react";

function App() {
  const [keyword, setKeyword] = useState("");
  const [images, setImages] = useState([]);
  const [bgGradient, setBgGradient] = useState(
    "linear-gradient(to right, #fff, #eee)"
  );
  const [tempGradient, setTempGradient] = useState(null);
  const [modalUrl, setModalUrl] = useState(null);
  const [loadedCount, setLoadedCount] = useState(0);

  // 검색어 기반 gradient 생성
  const generateGradient = (keyword) => {
    let hash = 0;
    for (let i = 0; i < keyword.length; i++) {
      hash = keyword.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color1 = `hsl(${hash % 360}, 70%, 80%)`;
    const color2 = `hsl(${(hash + 180) % 360}, 70%, 70%)`;
    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  console.log("Using BACKEND_URL:", BACKEND_URL);
  const handleSearch = async () => {
    if (!keyword) return;

    // 검색어 기반 임시 gradient 저장 (로딩 완료 후 적용)
    setTempGradient(generateGradient(keyword));

    const res = await fetch(`${BACKEND_URL}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });
    const data = await res.json();
    setImages(data.images || []);
    setLoadedCount(0); // 로딩 카운트 초기화
  };

  const handleImageLoad = () => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      // 모든 이미지가 로드되면 배경 gradient 적용
      if (next === images.length && tempGradient) {
        setBgGradient(tempGradient);
        setTempGradient(null);
      }
      return next;
    });
  };

  const openModal = (url) => setModalUrl(url);
  const closeModal = () => setModalUrl(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "50px",
        fontFamily: "Arial",
        background: bgGradient,
        transition: "background 0.8s ease",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        🖼️ My Gallery
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <input
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Put a keyword..."
        />
        <button
          style={{
            padding: "12px 20px",
            marginLeft: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s",
          }}
          onClick={handleSearch}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#45a049")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#4CAF50")
          }
        >
          Search
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            style={{
              overflow: "hidden",
              borderRadius: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.4s, box-shadow 0.4s, opacity 0.6s",
              opacity: 0,
              animation: `fadeIn 0.6s forwards ${idx * 0.1}s`,
            }}
          >
            <img
              src={url}
              alt="search result"
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.4s",
              }}
              onLoad={handleImageLoad}
              onClick={() => openModal(url)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.parentElement.style.boxShadow =
                  "0 8px 20px rgba(0,0,0,0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.parentElement.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.1)";
              }}
            />
          </div>
        ))}
      </div>

      {modalUrl && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={modalUrl}
            alt="원본 이미지"
            style={{ maxHeight: "90%", maxWidth: "90%", borderRadius: "12px" }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;
