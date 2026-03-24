import React, { useEffect } from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useParams, useNavigate as useRouterNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";

const AMENITIES = [
  "📶 Wifi miễn phí",
  "❄️ Điều hòa",
  "🚿 Phòng tắm riêng",
  "🅿️ Bãi đỗ xe",
  "☕ Bữa sáng",
  "🧹 Dọn phòng hằng ngày",
];

const HotelDetailPage = () => {
  const { id } = useParams();
  const navigate = useRouterNavigate();
  const { currentHotel, fetchHotelDetail, setBookingField } = useAppStore();

  useEffect(() => {
    fetchHotelDetail(id);
  }, [id]);

  const handleBooking = () => {
    if (currentHotel) {
      setBookingField("hotelId", currentHotel.id);
      setBookingField("hotelName", currentHotel.name);
    }
    navigate("/booking");
  };

  if (!currentHotel) {
    return (
      <Page>
        <Box style={{ padding: 24, textAlign: "center" }}>
          <Text>Đang tải thông tin khách sạn...</Text>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      {/* Hero Photo */}
      <Box style={{ position: "relative", height: 240, overflow: "hidden" }}>
        {currentHotel.thumbnail ? (
          <img
            src={currentHotel.thumbnail}
            alt={currentHotel.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box style={{ width: "100%", height: "100%", background: "linear-gradient(165deg, #1A2535 0%, #1D4E6B 60%, #1D7FA3 100%)" }} />
        )}
        {/* Gradient overlay */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "linear-gradient(to top, rgba(26,37,53,0.92) 0%, transparent 100%)",
            padding: "0 16px 14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Box style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span
              style={{
                background: currentHotel.tagColor,
                color: "#fff",
                fontSize: 10,
                padding: "3px 10px",
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {currentHotel.tag}
            </span>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>
              {"⭐".repeat(currentHotel.stars || 3)}
            </Text>
          </Box>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
            {currentHotel.name}
          </Text>
        </Box>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute", top: 12, left: 12,
            background: "rgba(0,0,0,0.45)",
            border: "none", borderRadius: 20,
            color: "#fff", fontSize: 13,
            padding: "6px 12px", cursor: "pointer",
          }}
        >
          ← Quay lại
        </button>
      </Box>

      {/* Location strip */}
      <Box
        style={{
          background: "#F5F0E8",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Box style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
          <Text style={{ color: "#2C3E50", fontSize: 12 }} numberOfLines={1}>
            📍 {currentHotel.addr}
          </Text>
          <Text style={{ color: "#1D7FA3", fontSize: 12, fontWeight: 600 }}>
            🌊 {currentHotel.dist}
          </Text>
        </Box>
        {currentHotel.mapsUrl && (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#4285F4",
              borderRadius: 20,
              padding: "7px 14px",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(66,133,244,0.35)",
            }}
            onClick={() => window.open(currentHotel.mapsUrl)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Chỉ đường</Text>
          </Box>
        )}
      </Box>

      {/* Image gallery strip */}
      {currentHotel.images && currentHotel.images.length > 1 && (
        <Box
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 16px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {currentHotel.images.slice(1).map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              style={{
                width: 100,
                height: 70,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
              loading="lazy"
            />
          ))}
        </Box>
      )}

      <Box style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Mô tả */}
        <Box className="info-card">
          <Text className="card-title">Giới thiệu</Text>
          <Text style={{ fontSize: 13, color: "#7F8C8D", lineHeight: 1.6 }}>
            {currentHotel.excerpt || currentHotel.content}
          </Text>
        </Box>

        {/* Giá */}
        <Box className="info-card">
          <Text className="card-title">Giá phòng</Text>
          <Box style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <Text style={{ color: "#C9A84C", fontSize: 24, fontWeight: 700 }}>
              {currentHotel.priceFrom?.toLocaleString("vi-VN")}₫
            </Text>
            <Text style={{ color: "#7F8C8D", fontSize: 13 }}>/đêm</Text>
          </Box>
          <Text style={{ fontSize: 12, color: "#7F8C8D", marginTop: 4 }}>
            Giá khởi điểm · Chưa bao gồm thuế phí
          </Text>
        </Box>

        {/* Tiện ích */}
        <Box className="info-card">
          <Text className="card-title">Tiện ích nổi bật</Text>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 8,
            }}
          >
            {AMENITIES.map((a) => (
              <Text key={a} style={{ fontSize: 12, color: "#7F8C8D" }}>
                {a}
              </Text>
            ))}
          </Box>
        </Box>

        {/* Danh sách phòng */}
        {currentHotel.rooms && currentHotel.rooms.length > 0 && (
          <Box className="info-card">
            <Text className="card-title" style={{ marginBottom: 12 }}>Các loại phòng</Text>
            <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentHotel.rooms.map((room) => (
                <Box
                  key={room.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "0.5px solid rgba(0,0,0,0.10)",
                    background: "#FAFAFA",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/hotel/${currentHotel.id}/room/${room.id}`)}
                >
                  <img
                    src={room.thumbnail || currentHotel.thumbnail}
                    alt={room.name}
                    style={{ width: 90, height: 80, objectFit: "cover", flexShrink: 0 }}
                    loading="lazy"
                  />
                  <Box style={{ flex: 1, padding: "10px 10px 10px 0" }}>
                    <Text style={{ fontSize: 13, fontWeight: 700, color: "#1A2535", display: "block" }}>
                      {room.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#7F8C8D", marginTop: 2, display: "block" }}>
                      {room.beds} · đến {room.maxGuests} khách · {room.size}m²
                    </Text>
                    <Box style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                      <Text style={{ color: "#C9A84C", fontSize: 14, fontWeight: 700 }}>
                        {room.priceFrom?.toLocaleString("vi-VN")}₫
                      </Text>
                      <Text style={{ color: "#7F8C8D", fontSize: 10 }}>/đêm</Text>
                    </Box>
                  </Box>
                  <Box
                    style={{
                      padding: "0 12px 0 0",
                      display: "flex",
                      alignItems: "center",
                      color: "#C9A84C",
                      fontSize: 18,
                    }}
                  >
                    ›
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* CTA */}
        <Button
          style={{
            background: "#C9A84C",
            color: "#1A2535",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            height: 48,
          }}
          onClick={handleBooking}
        >
          Đặt phòng {currentHotel.name}
        </Button>
      </Box>
    </Page>
  );
};

export default HotelDetailPage;
