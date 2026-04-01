"use client";
import { useState, useRef } from "react";

export default function Create2Page() {
  const [status, setStatus] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    setStatus("업로드 중...");
    setUploadedUrls([]);
    setPostId(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    
    // 게시물 정보 추가 (선택사항)
    formData.append("caption", "테스트 게시물");
    formData.append("location", "서울, 대한민국");
    formData.append("hashtags", JSON.stringify(["테스트", "S3"]));
    formData.append("is_public", "true");

    try {
      const res = await fetch("/api/create2", {
        method: "POST",
        credentials: "include", // 쿠키 포함
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus(`✅ 업로드 및 저장 성공! (${data.count}개 이미지)`);
        setUploadedUrls(data.image_urls || []);
        setPostId(data.post_id || null);
      } else {
        setStatus(`❌ 실패: ${data.error || "알 수 없는 오류"}`);
      }
    } catch (err) {
      setStatus(`❌ 오류: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Create2 - 게시물 생성 (S3 + DB)</h1>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          border: `2px dashed ${isDragging ? "#4CAF50" : "#ccc"}`,
          borderRadius: "8px",
          padding: "60px 20px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragging ? "#f0f8f0" : "#fafafa",
          transition: "all 0.3s ease",
          marginBottom: "20px",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: "48px", marginBottom: "10px" }}>📸</div>
        <p style={{ fontSize: "18px", marginBottom: "10px", color: "#666" }}>
          {isDragging ? "여기에 이미지를 놓으세요" : "이미지를 드래그하거나 클릭하여 선택하세요"}
        </p>
        <p style={{ fontSize: "14px", color: "#999" }}>
          JPEG, PNG, WebP 형식 지원 (최대 10개)
        </p>
      </div>

      <p style={{ color: uploading ? "#666" : "#333", textAlign: "center", marginBottom: "20px" }}>
        {status || "이미지를 선택하세요"}
      </p>

      {postId && (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#e8f5e9", 
          borderRadius: "4px", 
          marginBottom: "20px",
          textAlign: "center"
        }}>
          <p style={{ margin: 0, color: "#2e7d32", fontWeight: "bold" }}>
            게시물 ID: {postId}
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#666" }}>
            S3에 업로드되고 DB에 저장되었습니다!
          </p>
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <div>
          <h2>업로드된 이미지 ({uploadedUrls.length}개)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginTop: "10px" }}>
            {uploadedUrls.map((url, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "4px" }}>
                <img
                  src={url}
                  alt={`Uploaded ${idx + 1}`}
                  style={{ width: "100%", height: "auto", borderRadius: "4px" }}
                />
                <p style={{ fontSize: "12px", marginTop: "5px", wordBreak: "break-all" }}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    URL 보기
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
