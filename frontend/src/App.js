import { useState, useEffect, useRef } from "react";
import { BACKEND_URL } from "./config";

function App() {
  console.log("Backend URL:", BACKEND_URL);
  const [keyword, setKeyword] = useState("");
  const [images, setImages] = useState([]);
  const [bgGradient, setBgGradient] = useState(
    "linear-gradient(to right, #fff, #eee)"
  );
  const [tempGradient, setTempGradient] = useState(null);
  const [modalUrl, setModalUrl] = useState(null);
  const [modalImageData, setModalImageData] = useState(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const gridRef = useRef(null);

  // 화면 크기에 맞는 이미지 개수 계산
  const calculateOptimalImageCount = () => {
    const containerWidth = window.innerWidth - 100; // padding 고려
    const containerHeight = window.innerHeight - 250; // 헤더, 검색바, 여백 고려

    const minImageWidth = 250; // CSS에서 설정한 최소 너비
    const imageHeight = 250;
    const gap = 20;

    // 가로로 들어갈 수 있는 이미지 개수
    const columnsPerRow = Math.floor((containerWidth + gap) / (minImageWidth + gap));

    // 세로로 들어갈 수 있는 행 개수 (여유를 두고 계산)
    const maxRows = Math.ceil((containerHeight + gap) / (imageHeight + gap));

    // 총 이미지 개수 (최소 6개, 최대 30개)
    const totalImages = Math.min(Math.max(columnsPerRow * maxRows, 6), 30);

    console.log(`화면 크기: ${containerWidth}x${containerHeight}, 컬럼: ${columnsPerRow}, 행: ${maxRows}, 최적 이미지 수: ${totalImages}`);
    return totalImages;
  };

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

  // 이미지 검색 함수
  const handleSearch = async (isNewSearch = true) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setError("Input a keyword to search images.");
      return;
    }

    if (isNewSearch) {
      setIsLoading(true);
      setImages([]);
      setCurrentPage(1);
      setError(null);
      setTotalImages(0);
      setTempGradient(generateGradient(trimmedKeyword));
    } else {
      setIsLoadingMore(true);
    }

    const requestCount = isNewSearch ? calculateOptimalImageCount() : 12;
    const requestPage = isNewSearch ? 1 : currentPage + 1;

    try {
      console.log(`API 요청 - 키워드: ${trimmedKeyword}, 개수: ${requestCount}, 페이지: ${requestPage}`);

      const response = await fetch(`${BACKEND_URL}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: trimmedKeyword,
          count: requestCount,
          page: requestPage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status} 오류`);
      }

      const data = await response.json();

      if (!data.images || data.images.length === 0) {
        if (isNewSearch) {
          setError("Threre are no images matching your search.");
          setImages([]);
        }
        setHasMore(false);
        return;
      }

      if (isNewSearch) {
        setImages(data.images);
        setTotalImages(data.images.length);
      } else {
        setImages(prev => [...prev, ...data.images]);
        setTotalImages(prev => prev + data.images.length);
        setCurrentPage(requestPage);
      }

      setHasMore(data.has_more || false);
      setLoadedCount(0);

      console.log(`성공: ${data.images.length}개 이미지 로드, 더 보기 가능: ${data.has_more}`);

    } catch (error) {
      console.error("검색 오류:", error);

      let errorMessage = "검색 중 오류가 발생했습니다.";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
      } else if (error.message.includes("429")) {
        errorMessage = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (isNewSearch) {
        setImages([]);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 더 많은 이미지 로드
  const loadMoreImages = () => {
    if (!isLoadingMore && hasMore) {
      handleSearch(false);
    }
  };

  // 이미지 로드 완료 처리
  const handleImageLoad = () => {
    setLoadedCount((prev) => {
      const next = prev + 1;
      // 첫 번째 검색의 모든 이미지가 로드되면 배경 gradient 적용
      const initialImageCount = calculateOptimalImageCount();
      if (next >= Math.min(initialImageCount, images.length) && tempGradient) {
        setBgGradient(tempGradient);
        setTempGradient(null);
      }
      return next;
    });
  };

  // 이미지 로드 실패 처리
  const handleImageError = (e, imageData) => {
    console.warn("이미지 로딩 실패:", imageData?.url || e.target.src);
    // 실패한 이미지 컨테이너 숨기기
    if (e.target.parentElement) {
      e.target.parentElement.style.display = "none";
    }
  };

  // 모달 열기
  const openModal = (imageData) => {
    setModalUrl(imageData.full || imageData.url);
    setModalImageData(imageData);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
  };

  // 모달 닫기
  const closeModal = () => {
    setModalUrl(null);
    setModalImageData(null);
    // 스크롤 복원
    document.body.style.overflow = 'unset';
  };

  // 자동 스크롤 로딩
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // 하단에서 800px 이내에 도달하면 자동 로딩
      if (scrollTop + clientHeight >= scrollHeight - 800) {
        if (hasMore && !isLoadingMore && !isLoading) {
          loadMoreImages();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, isLoading]);

  // 윈도우 리사이즈 처리 (디바운싱)
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (keyword && images.length > 0 && !isLoading) {
          const optimalCount = calculateOptimalImageCount();
          // 현재 이미지 수가 최적 개수보다 적고, 더 로딩할 수 있다면 추가 로딩
          if (images.length < optimalCount && hasMore && !isLoadingMore) {
            console.log("리사이즈로 인한 추가 로딩");
            loadMoreImages();
          }
        }
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [keyword, images.length, isLoading, hasMore, isLoadingMore]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalUrl) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalUrl]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "50px",
        fontFamily: "Arial, sans-serif",
        background: bgGradient,
        transition: "background 0.8s ease",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2.5rem" }}>
        🖼️ My Gallery
      </h1>

      {/* 검색 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          style={{
            flex: 1,
            maxWidth: "400px",
            minWidth: "250px",
            padding: "12px 16px",
            fontSize: "16px",
            borderRadius: "8px",
            border: error ? "2px solid #ff4444" : "1px solid #ccc",
            outline: "none",
            transition: "border-color 0.3s",
          }}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (error) setError(null);
          }}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSearch(true)}
          onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
          onBlur={(e) => e.target.style.borderColor = error ? "#ff4444" : "#ccc"}
          placeholder="Search images by keyword..."
          disabled={isLoading}
        />
        <button
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isLoading ? "#ccc" : "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            minWidth: "120px",
            fontSize: "16px",
          }}
          onClick={() => handleSearch(true)}
          disabled={isLoading}
          onMouseOver={(e) =>
            !isLoading && (e.currentTarget.style.backgroundColor = "#45a049")
          }
          onMouseOut={(e) =>
            !isLoading && (e.currentTarget.style.backgroundColor = "#4CAF50")
          }
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={{
          textAlign: "center",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#ffebee",
          color: "#c62828",
          borderRadius: "8px",
          border: "1px solid #ffcdd2",
          maxWidth: "600px",
          margin: "0 auto 20px auto",
          fontSize: "14px",
        }}>
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #4CAF50",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ marginTop: "15px", color: "#666", fontSize: "16px" }}>
            Searching images for "{keyword}"...
          </p>
        </div>
      )}

      {/* 이미지 그리드 */}
      <div
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {images.map((imageData, idx) => (
          <div
            key={`${keyword}-${imageData.id}-${idx}`}
            style={{
              overflow: "hidden",
              borderRadius: "16px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.4s ease",
              opacity: 0,
              animation: `fadeIn 0.6s forwards ${(idx % 12) * 0.05}s`,
              backgroundColor: "#f5f5f5",
            }}
          >
            <img
              src={imageData.small || imageData.url}
              alt={imageData.alt_description || `${keyword} result ${idx + 1}`}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.4s ease",
              }}
              onLoad={handleImageLoad}
              onError={(e) => handleImageError(e, imageData)}
              onClick={() => openModal(imageData)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.parentElement.style.transform = "translateY(-8px)";
                e.currentTarget.parentElement.style.boxShadow =
                  "0 12px 30px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.parentElement.style.transform = "translateY(0)";
                e.currentTarget.parentElement.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.1)";
              }}
              loading="lazy"
            />

            {/* 이미지 정보 오버레이 */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              color: "white",
              padding: "20px 15px 15px",
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
            >
              <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold" }}>
                📷 {imageData.photographer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 더 보기 영역 */}
      {images.length > 0 && !isLoading && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <div style={{
            color: "#666",
            fontSize: "14px",
            marginBottom: "20px"
          }}>
            현재 <strong>{totalImages}</strong>images loaded
            {hasMore && " · Scroll down to load more"}
          </div>

          {hasMore && (
            <>
              <button
                onClick={loadMoreImages}
                disabled={isLoadingMore}
                style={{
                  padding: "15px 35px",
                  borderRadius: "30px",
                  border: "2px solid #4CAF50",
                  backgroundColor: isLoadingMore ? "#f5f5f5" : "transparent",
                  color: isLoadingMore ? "#999" : "#4CAF50",
                  fontWeight: "bold",
                  cursor: isLoadingMore ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  marginBottom: "20px",
                  fontSize: "16px",
                }}
                onMouseOver={(e) => {
                  if (!isLoadingMore) {
                    e.currentTarget.style.backgroundColor = "#4CAF50";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoadingMore) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#4CAF50";
                  }
                }}
              >
                {isLoadingMore ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid #ddd",
                      borderTop: "2px solid #999",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    불러오는 중...
                  </span>
                ) : (
                  "See more images +"
                )}
              </button>

              {isLoadingMore && (
                <div style={{
                  color: "#999",
                  fontSize: "12px",
                  fontStyle: "italic"
                }}>
                  Loading more images by scrolling down...
                </div>
              )}
            </>
          )}

          {!hasMore && images.length > 0 && (
            <div style={{
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#6c757d",
              fontStyle: "italic",
              border: "1px solid #e9ecef"
            }}>
              🎉 Images load complete!
            </div>
          )}
        </div>
      )}

      {/* 이미지 모달 */}
      {modalUrl && modalImageData && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
            padding: "20px",
          }}
        >
          <img
            src={modalUrl}
            alt={modalImageData.alt_description || "원본 이미지"}
            style={{
              maxHeight: "80vh",
              maxWidth: "90vw",
              borderRadius: "12px",
              objectFit: "contain",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* 이미지 정보 */}
          <div style={{
            marginTop: "20px",
            textAlign: "center",
            color: "white",
            maxWidth: "600px"
          }}>
            <p style={{
              margin: "5px 0",
              fontSize: "16px",
              fontWeight: "bold"
            }}>
              📷 Photographer:
              <a
                href={modalImageData.photographer_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4CAF50", textDecoration: "none", marginLeft: "5px" }}
                onClick={(e) => e.stopPropagation()}
              >
                {modalImageData.photographer}
              </a>
            </p>
            {modalImageData.alt_description && (
              <p style={{
                margin: "5px 0",
                fontSize: "14px",
                color: "#ccc"
              }}>
                {modalImageData.alt_description}
              </p>
            )}
            <p style={{
              margin: "10px 0 0 0",
              fontSize: "12px",
              color: "#999"
            }}>
              Closed by clicking outside the image or pressing ESC
            </p>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#333",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#ff4444";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
              e.currentTarget.style.color = "#333";
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 스크롤바 스타일링 */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #4CAF50;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #45a049;
        }

        /* 반응형 스타일 */
        @media (max-width: 768px) {
          .gallery-container {
            padding: 20px;
          }
          .gallery-title {
            font-size: 2rem;
          }
          .search-input {
            font-size: 16px; /* iOS 줌 방지 */
          }
        }
      `}</style>
    </div>
  );
}

export default App;