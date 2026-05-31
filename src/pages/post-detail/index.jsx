import React, { useEffect } from "react";
import { Page, Box, Text } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import BottomBar from "../../components/BottomBar";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPost, postLoading, fetchPostDetail } = useAppStore();

  useEffect(() => {
    fetchPostDetail(id);
  }, [id]);

  return (
    <Page>
      {(postLoading || !currentPost || String(currentPost.id) !== String(id)) ? (
        <Box style={{ padding: 32, textAlign: "center" }}>
          <Text style={{ color: "#7F8C8D", fontSize: 14 }}>Đang tải bài viết...</Text>
        </Box>
      ) : (
        <>
          {currentPost.thumbnail && (
            <img
              src={currentPost.thumbnail}
              alt={currentPost.title}
              style={{ width: "100%", maxHeight: 240, objectFit: "cover", display: "block" }}
            />
          )}

          {/* paddingBottom 90 để chừa chỗ cho BottomBar */}
          <Box style={{ padding: "16px 16px 90px" }}>
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

            {currentPost.date && (
              <Text style={{ fontSize: 11, color: "#7F8C8D", marginBottom: 16, display: "block" }}>
                {new Date(currentPost.date).toLocaleDateString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                })}
              </Text>
            )}

            <Box
              style={{ fontSize: 14, color: "#2C3E50", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          </Box>
        </>
      )}

      <BottomBar to="/explore" />
    </Page>
  );
};

export default PostDetailPage;
