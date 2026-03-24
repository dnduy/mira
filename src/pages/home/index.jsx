import React, { useEffect, useCallback, useState, useRef } from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import HotelCard from "../../components/HotelCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import Footer from "../../components/Footer";
import "./styles.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, hotels, hotelsLoading, hotelsError, fetchHotels } = useAppStore();

  useEffect(() => {
    if (hotels.length === 0) fetchHotels();
  }, []);

  // Pull-to-refresh thủ công bằng touch events
  const touchStartY = useRef(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = useCallback(async (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Chỉ refresh khi vuốt xuống > 80px và đang ở đầu trang
    if (deltaY > 80 && window.scrollY === 0 && !hotelsLoading) {
      setRefreshing(true);
      await fetchHotels();
      setRefreshing(false);
    }
  }, [fetchHotels, hotelsLoading]);

  return (
    <Page className="home-page" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Hero Banner */}
      <Box style={{ position: "relative", overflow: "hidden" }}>
        <img
          src="https://miraquynhon.com/wp-content/uploads/2024/08/choi-le-quoc-khanh-2-9-tai-quy-nhon-khach-san-mira-luu-tru.jpg"
          alt="Quy Nhon beach"
          style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
        />
        <Box
          className="hero-banner"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(165deg, rgba(26,37,53,0.80) 0%, rgba(29,78,107,0.65) 60%, rgba(29,127,163,0.40) 100%)",
          }}
        >
          <Text className="hero-greeting">
            Xin chào{user?.name ? `, ${user.name}` : ""} 👋
          </Text>
          <Text className="hero-title">
            Khám phá Quy Nhơn{"\n"}cùng Mira Hotel
          </Text>
          <Text className="hero-sub">7 khách sạn · Cách biển ≤ 200m</Text>
          <Box className="hero-actions">
            <Button
              className="btn-primary"
              onClick={() => navigate("/booking")}
            >
              Đặt phòng ngay
            </Button>
            <Button
              className="btn-ghost"
              onClick={() => navigate("/explore")}
            >
              Khám phá
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box className="stats-row">
        {[
          { value: "7", label: "Khách sạn", color: "#C9A84C" },
          { value: "50m", label: "Gần biển nhất", color: "#1D7FA3" },
          { value: "3★", label: "Tiêu chuẩn", color: "#27ae60" },
        ].map((s) => (
          <Box key={s.label} className="stat-card">
            <Text style={{ color: s.color, fontSize: 18, fontWeight: 600 }}>
              {s.value}
            </Text>
            <Text className="stat-label">{s.label}</Text>
          </Box>
        ))}
      </Box>

      {/* Hotel List */}
      <Box className="section">
        <Text className="section-title">Hệ thống khách sạn</Text>

        {hotelsLoading && <LoadingSkeleton count={3} />}

        {hotelsError && (
          <Box className="error-box">
            <Text>Không tải được dữ liệu. Vui lòng thử lại.</Text>
            <Button size="small" onClick={fetchHotels}>Thử lại</Button>
          </Box>
        )}

        {!hotelsLoading &&
          hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onClick={() => navigate(`/hotel/${hotel.id}`)}
            />
          ))}
      </Box>

      {/* Footer */}
      <Footer />
    </Page>
  );
};

export default HomePage;
