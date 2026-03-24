import React from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import { handleShareRoom } from "../../utils/share";
import BackBar from "../../components/BackBar";

const RoomDetailPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { hotels, setBookingField } = useAppStore();

  const hotel = hotels.find((h) => String(h.id) === String(hotelId));
  const room = hotel?.rooms?.find((r) => r.id === roomId);

  if (!hotel || !room) {
    return (
      <Page>
        <Box style={{ padding: 24, textAlign: "center" }}>
          <Text style={{ color: "#7F8C8D", fontSize: 14 }}>
            Không tìm thấy thông tin phòng.
          </Text>
          <Button
            style={{ marginTop: 16 }}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </Box>
      </Page>
    );
  }

  const handleBooking = () => {
    setBookingField("hotelId", hotel.id);
    setBookingField("hotelName", `${hotel.name} – ${room.name}`);
    navigate("/booking");
  };

  return (
    <Page>
      <BackBar />
      {/* Hero */}
      <Box style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <img
          src={room.thumbnail || hotel.thumbnail}
          alt={room.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* gradient overlay */}
        <Box
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 130,
            background: "linear-gradient(to top, rgba(26,37,53,0.95) 0%, transparent 100%)",
            padding: "0 16px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 11,
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            {hotel.name}
          </Text>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
            {room.name}
          </Text>
        </Box>
      </Box>

      {/* Gallery strip */}
      {room.images && room.images.length > 1 && (
        <Box
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 16px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {room.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              loading="lazy"
            />
          ))}
        </Box>
      )}

      <Box style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Thông số nhanh */}
        <Box
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          {[
            { icon: "👥", value: `${room.maxGuests} khách`, label: "Sức chứa" },
            { icon: "📐", value: `${room.size}m²`, label: "Diện tích" },
            { icon: "🛏️", value: room.beds, label: "Giường" },
          ].map((spec) => (
            <Box
              key={spec.label}
              style={{
                flex: 1,
                background: "#F8F9FA",
                borderRadius: 10,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <Text style={{ fontSize: 18, display: "block", marginBottom: 4 }}>
                {spec.icon}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#1A2535", display: "block" }}>
                {spec.value}
              </Text>
              <Text style={{ fontSize: 10, color: "#7F8C8D" }}>{spec.label}</Text>
            </Box>
          ))}
        </Box>

        {/* Mô tả */}
        <Box
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 14,
            border: "0.5px solid rgba(0,0,0,0.08)",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#7F8C8D",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 8,
              display: "block",
            }}
          >
            Giới thiệu phòng
          </Text>
          <Text style={{ fontSize: 13, color: "#2C3E50", lineHeight: 1.7 }}>
            {room.excerpt}
          </Text>
        </Box>

        {/* Tiện ích */}
        <Box
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 14,
            border: "0.5px solid rgba(0,0,0,0.08)",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#7F8C8D",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 10,
              display: "block",
            }}
          >
            Tiện ích phòng
          </Text>
          <Box style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {room.amenities?.map((a) => (
              <span
                key={a}
                style={{
                  background: "#F0F8FF",
                  border: "0.5px solid #BDE3F5",
                  borderRadius: 20,
                  fontSize: 11,
                  color: "#1D7FA3",
                  padding: "4px 12px",
                  fontWeight: 500,
                }}
              >
                {a}
              </span>
            ))}
          </Box>
        </Box>

        {/* Giá + CTA */}
        <Box
          style={{
            background: "#FFFBF0",
            borderRadius: 12,
            padding: 14,
            border: "0.5px solid rgba(201,168,76,0.3)",
          }}
        >
          <Text style={{ fontSize: 11, color: "#7F8C8D", marginBottom: 4, display: "block" }}>
            Giá từ
          </Text>
          <Box style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <Text style={{ color: "#C9A84C", fontSize: 26, fontWeight: 700 }}>
              {room.priceFrom?.toLocaleString("vi-VN")}₫
            </Text>
            <Text style={{ color: "#7F8C8D", fontSize: 12 }}>/đêm</Text>
          </Box>
          <Text style={{ fontSize: 11, color: "#7F8C8D" }}>
            Chưa bao gồm thuế phí · Giá có thể thay đổi theo mùa
          </Text>
        </Box>

        <Box style={{ display: "flex", gap: 10 }}>
          <Button
            style={{
              flex: 1,
              background: "#C9A84C",
              color: "#1A2535",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              height: 50,
            }}
            onClick={handleBooking}
          >
            Đặt phòng này ngay
          </Button>
          {/* Nút chia sẻ phòng đến bạn bè Zalo */}
          <Button
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
            onClick={() => handleShareRoom(hotel, room)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default RoomDetailPage;
