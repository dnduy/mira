import React from "react";
import { Box, Text } from "zmp-ui";

const HotelCard = ({ hotel, onClick }) => (
  <Box
    onClick={onClick}
    style={{
      background: "#fff",
      borderRadius: 12,
      marginBottom: 10,
      overflow: "hidden",
      border: "0.5px solid rgba(0,0,0,0.08)",
      cursor: "pointer",
    }}
  >
    {/* Thumbnail */}
    {hotel.thumbnail && (
      <Box style={{ position: "relative", height: 160, overflow: "hidden" }}>
        <img
          src={hotel.thumbnail}
          alt={hotel.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: hotel.tagColor || "#7F8C8D",
            color: "#fff",
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          {hotel.tag || "Khách sạn"}
        </span>
      </Box>
    )}

    {/* Card Info */}
    <Box style={{ padding: "12px 14px" }}>
      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <Box style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: "#1A2535", marginBottom: 2 }}>
            {hotel.name}
          </Text>
          <Text style={{ color: "#7F8C8D", fontSize: 11 }}>
            {"⭐".repeat(hotel.stars || 3)}
          </Text>
        </Box>
        <Box style={{ textAlign: "right", flexShrink: 0 }}>
          <Text style={{ color: "#C9A84C", fontSize: 14, fontWeight: 700 }}>
            {hotel.priceFrom?.toLocaleString("vi-VN") || "---"}₫
          </Text>
          <Text style={{ color: "#7F8C8D", fontSize: 10 }}>/đêm</Text>
        </Box>
      </Box>
      <Text style={{ color: "#2C3E50", fontSize: 12, marginBottom: 2 }}>{hotel.addr}</Text>
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
        <Text style={{ color: "#1D7FA3", fontSize: 11, fontWeight: 500 }}>
          📍 {hotel.dist}
        </Text>
        {hotel.mapsUrl && (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#EBF3FE",
              borderRadius: 12,
              padding: "4px 10px",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(hotel.mapsUrl);
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <Text style={{ color: "#4285F4", fontSize: 11, fontWeight: 600 }}>Chỉ đường</Text>
          </Box>
        )}
      </Box>
    </Box>
  </Box>
);

export default HotelCard;
