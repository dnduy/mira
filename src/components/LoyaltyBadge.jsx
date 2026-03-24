import React, { useState } from "react";
import { Box, Text, Button } from "zmp-ui";
import { useAppStore } from "../services/store";

const TIERS = [
  { min: 0,    label: "Thành viên",  color: "#888",    bg: "#f0f0f0",    icon: "🧳" },
  { min: 300,  label: "Bạc",         color: "#6b7280", bg: "#e5e7eb",    icon: "🥈" },
  { min: 700,  label: "Vàng",        color: "#C9A84C", bg: "#FFF8EC",    icon: "🥇" },
  { min: 1500, label: "Bạch Kim",    color: "#1D7FA3", bg: "#e0f2fe",    icon: "💎" },
];

function getTier(points) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

const LoyaltyBadge = () => {
  const { loyaltyPoints } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const tier = getTier(loyaltyPoints);

  return (
    <>
      {/* Badge nhỏ hiển thị trên hero */}
      <Box
        onClick={() => setShowModal(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(6px)",
          borderRadius: 20,
          padding: "4px 10px",
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <Text style={{ fontSize: 14 }}>{tier.icon}</Text>
        <Text style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>
          {loyaltyPoints.toLocaleString("vi-VN")} điểm
        </Text>
        <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>·</Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
          {tier.label}
        </Text>
      </Box>

      {/* Modal chi tiết */}
      {showModal && (
        <Box
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 700, color: "#1A2535", marginBottom: 4 }}>
              Điểm tích luỹ của bạn
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
              Mỗi lần đặt phòng thành công = +100 điểm
            </Text>

            {/* Thanh điểm */}
            <Box style={{ marginBottom: 20 }}>
              <Box style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: "#555" }}>Điểm hiện tại</Text>
                <Text style={{ fontSize: 15, fontWeight: 700, color: tier.color }}>
                  {tier.icon} {loyaltyPoints.toLocaleString("vi-VN")} điểm
                </Text>
              </Box>
              <Box
                style={{
                  height: 8,
                  background: "#eee",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${Math.min(100, (loyaltyPoints / 1500) * 100)}%`,
                    height: "100%",
                    background: tier.color,
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
            </Box>

            {/* Bảng hạng */}
            {TIERS.map((t) => (
              <Box
                key={t.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: loyaltyPoints >= t.min ? t.bg : "#fafafa",
                  border: `1px solid ${loyaltyPoints >= t.min ? t.color + "44" : "#eee"}`,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{t.icon}</Text>
                <Box style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: loyaltyPoints >= t.min ? t.color : "#aaa" }}>
                    {t.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#999" }}>
                    Từ {t.min.toLocaleString("vi-VN")} điểm
                  </Text>
                </Box>
                {loyaltyPoints >= t.min && (
                  <Text style={{ fontSize: 11, color: t.color, fontWeight: 600 }}>✓ Đạt</Text>
                )}
              </Box>
            ))}

            <Button
              style={{
                marginTop: 8,
                width: "100%",
                background: "#1A2535",
                color: "#fff",
                borderRadius: 12,
                fontWeight: 600,
              }}
              onClick={() => setShowModal(false)}
            >
              Đóng
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default LoyaltyBadge;
