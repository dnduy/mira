/**
 * Modal kêu gọi kết nối với OA Mira sau khi đặt phòng thành công.
 * Hiển thị dạng bottom sheet, không block booking flow.
 */
import React from "react";
import { Box, Text, Button } from "zmp-ui";

const BENEFITS = [
  { icon: "📋", text: "Xác nhận đặt phòng tức thì qua Zalo" },
  { icon: "🎁", text: "Nhận ưu đãi độc quyền thành viên" },
  { icon: "⭐", text: "Tích điểm loyalty mỗi lần đặt phòng" },
];

const ConnectOAModal = ({ isOpen, onAccept, onSkip }) => {
  if (!isOpen) return null;

  return (
    /* Backdrop */
    <Box
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        zIndex: 10001,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onSkip}
    >
      {/* Modal card */}
      <Box
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 40px",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top handle bar */}
        <Box
          style={{
            width: 40,
            height: 4,
            background: "#e0d8c8",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        {/* Icon / logo area */}
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #1A2535, #1D4E6B)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Text style={{ fontSize: 32, lineHeight: 1 }}>🏨</Text>
        </Box>

        {/* Title */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1A2535",
            textAlign: "center",
            display: "block",
            marginBottom: 8,
          }}
        >
          Nhận xác nhận đặt phòng qua Zalo
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 13,
            color: "#7F8C8D",
            textAlign: "center",
            lineHeight: 1.6,
            display: "block",
            marginBottom: 24,
          }}
        >
          Kết nối để nhận thông báo check-in,{"\n"}ưu đãi thành viên và tích điểm
        </Text>

        {/* Benefits */}
        <Box style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {BENEFITS.map(({ icon, text }) => (
            <Box
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "#FFF8EC",
                borderRadius: 12,
                border: "1px solid #F0E4C0",
              }}
            >
              <Text style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</Text>
              <Text style={{ fontSize: 13, color: "#1A2535", fontWeight: 500 }}>{text}</Text>
            </Box>
          ))}
        </Box>

        {/* Primary CTA */}
        <Button
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #C9A84C, #E8C96A)",
            color: "#1A2535",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            height: 52,
            border: "none",
            marginBottom: 12,
          }}
          onClick={onAccept}
        >
          Kết nối ngay
        </Button>

        {/* Skip link */}
        <Box style={{ textAlign: "center" }}>
          <Text
            style={{
              fontSize: 13,
              color: "#B0A090",
              cursor: "pointer",
              padding: "8px 16px",
              display: "inline-block",
            }}
            onClick={onSkip}
          >
            Để sau
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ConnectOAModal;
