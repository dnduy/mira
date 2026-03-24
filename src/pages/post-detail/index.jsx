import React, { useEffect } from "react";
import { Page, Box, Text } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPost, postLoading, fetchPostDetail } = useAppStore();

  useEffect(() => {
    fetchPostDetail(id);
  }, [id]);

  return (
    <Page>
      {/* Back bar */}
      <Box
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          background: "#fff",
        }}
        onClick={() => navigate(-1)}
      >
        <Text style={{ fontSize: 20, color: "#1D7FA3", lineHeight: 1 }}>‹</Text>
        <Text style={{ fontSize: 14, color: "#1D7FA3", fontWeight: 500 }}>Quay lại</Text>
      </Box>

      {(postLoading || !currentPost || String(currentPost.id) !== String(id)) ? (
        <Box style={{ padding: 32, textAlign: "center" }}>
          <Text style={{ color: "#7F8C8D", fontSize: 14 }}>Đang tải bài viết...</Text>
        </Box>
      ) : (
        <>
          {/* Featured image */}
          {currentPost.thumbnail && (
            <img
              src={currentPost.thumbnail}
              alt={currentPost.title}
              style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
            />
          )}

          <Box style={{ padding: "16px 16px 40px" }}>
            {/* Category badge */}
            {currentPost.category && (
              <span
                style={{
                  background: "#0F6E56",
                  color: "#fff",
                  fontSize: 10,
                  padding: "3px 12px",
                  borderRadius: 10,
                  fontWeight: 600,
                  display: "inline-block",
                  marginBottom: 12,
                }}
              >
                {currentPost.category}
              </span>
            )}

            {/* Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1A2535",
                marginBottom: 6,
                lineHeight: 1.4,
                display: "block",
              }}
            >
              {currentPost.title}
            </Text>

            {/* Date */}
            {currentPost.date && (
              <Text style={{ fontSize: 11, color: "#7F8C8D", marginBottom: 16, display: "block" }}>
                {new Date(currentPost.date).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </Text>
            )}

            {/* Content – rendered from WP HTML (trusted source) */}
            <Box
              style={{
                fontSize: 14,
                color: "#2C3E50",
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          </Box>
        </>
      )}
    </Page>
  );
};

export default PostDetailPage;
