import React, { useEffect } from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import BackBar from "../../components/BackBar";

const ExplorePage = () => {
  const navigate = useNavigate();
  const { explorePosts, exploreLoading, fetchExplorePosts } = useAppStore();

  useEffect(() => {
    if (explorePosts.length === 0) fetchExplorePosts();
  }, []);

  // Fallback data khi WP chưa có bài
  const fallbackPosts = [
    {
      id: 1, title: "Bãi biển Quy Nhơn",
      excerpt: "Đường cong tuyệt đẹp ngay trung tâm TP, nước trong xanh, cát trắng mịn.",
      category: "Địa điểm",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/quy-nhon.jpg",
    },
    {
      id: 2, title: "Bãi Xếp – Ghềnh Ráng",
      excerpt: "Làng chài hoang sơ, bối cảnh phim 'Tôi thấy hoa vàng trên cỏ xanh'.",
      category: "Địa điểm",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/ngu-dan.jpg",
    },
    {
      id: 3, title: "Kỳ Co – Eo Gió",
      excerpt: "Thiên đường biển đẹp nhất miền Trung, nước màu ngọc lam tuyệt đẹp.",
      category: "Địa điểm",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/dam-o-loan.jpg",
    },
    {
      id: 4, title: "Tháp Đôi Quy Nhơn",
      excerpt: "Di tích Chăm Pa cổ kính hàng ngàn năm tuổi, ngay trung tâm thành phố.",
      category: "Di tích",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/keo-ca.jpg",
    },
    {
      id: 5, title: "Bánh xèo tôm nhảy",
      excerpt: "Đặc sản số 1 Quy Nhơn – giòn rụm, tôm nhảy tươi ngon không thể bỏ qua.",
      category: "Ẩm thực",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/an-sang-quy-nhon-4.jpg",
    },
    {
      id: 6, title: "Bún chả cá Bình Định",
      excerpt: "Bữa sáng đặc trưng không thể bỏ qua khi đến Quy Nhơn.",
      category: "Ẩm thực",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/an-sang-quy-nhon.jpg",
    },
    {
      id: 7, title: "Nem chợ Huyện",
      excerpt: "Nem chua đặc sản Bình Định, quà tặng ý nghĩa cho người thân.",
      category: "Ẩm thực",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/an-dem-quy-nhon-3.jpg",
    },
    {
      id: 8, title: "Chợ hải sản đêm",
      excerpt: "Hải sản tươi sống giá rẻ nhất Bình Định – phải ghé một lần.",
      category: "Ẩm thực",
      thumbnail: "https://miraquynhon.com/wp-content/uploads/2026/01/hai-san-quy-nhon-2.jpg",
    },
  ];

  const isWP = explorePosts.length > 0;
  const displayPosts = isWP ? explorePosts : fallbackPosts;

  const categories = [...new Set(displayPosts.map((p) => p.category || "Khám phá"))];

  return (
    <Page>
      <BackBar title="Khám phá Quy Nhơn" to="/" />
      {/* Header */}
      <Box
        style={{
          background: "linear-gradient(135deg, #0F6E56, #1D9E75)",
          padding: "16px 16px 24px",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginBottom: 4 }}>
          Cẩm nang du lịch
        </Text>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
          Khám phá Quy Nhơn
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 4 }}>
          Gợi ý từ team Mira Hotel
        </Text>
      </Box>

      <Box style={{ padding: "12px 16px" }}>
        {exploreLoading && <LoadingSkeleton count={4} />}

        {categories.map((cat) => (
          <Box key={cat} style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 12,
                color: "#7F8C8D",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              {cat}
            </Text>

            {displayPosts
              .filter((p) => (p.category || "Khám phá") === cat)
              .map((post) => (
                <Box
                  key={post.id}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    border: "0.5px solid rgba(0,0,0,0.08)",
                    cursor: isWP ? "pointer" : "default",
                  }}
                  onClick={isWP ? () => navigate(`/post/${post.id}`) : undefined}
                >
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 24, flexShrink: 0 }}>📍</Text>
                  )}
                  <Box>
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "#1A2535" }}>
                      {post.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#7F8C8D", marginTop: 2, lineHeight: 1.5 }}>
                      {post.excerpt}
                    </Text>
                  </Box>
                </Box>
              ))}
          </Box>
        ))}

        {/* Xem thêm */}
        <Button
          variant="secondary"
          style={{ width: "100%", borderRadius: 12, marginTop: 8 }}
          onClick={() => window.open("https://miraquynhon.com/kham-pha/")}
        >
          Xem thêm trên website →
        </Button>
      </Box>
    </Page>
  );
};

export default ExplorePage;
