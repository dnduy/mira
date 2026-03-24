import React from "react";
import { Box, Text } from "zmp-ui";
import { handleCall } from "../utils/contact";

// TODO: cập nhật số điện thoại thực tế và ID Zalo OA
const PHONE = "02563822222";
const PHONE_DISPLAY = "0256 382 2222";
const ZALO_PHONE = "02563822222";
const FB_PAGE = "https://www.facebook.com/miraquynhon";

const HOTELS = [
  { name: "Mira Quy Nhơn Hotel",  addr: "11A Ngô Mây, TP Quy Nhơn" },
  { name: "Mira Boutique Hotel",  addr: "20 Hàn Mặc Tử, TP Quy Nhơn" },
  { name: "Mira Grand Hotel",     addr: "7 Nguyễn Thị Định, TP Quy Nhơn" },
  { name: "Mira Bãi Xếp",        addr: "Bãi Xếp, Ghềnh Ráng, Quy Nhơn" },
  { name: "Mira Aloha Hotel",     addr: "50 Lê Lợi, TP Quy Nhơn" },
  { name: "Mira Eco Hotel",       addr: "24 Nguyễn Như Đỗ, TP Quy Nhơn" },
  { name: "Xavia Hotel",          addr: "24–25 Bùi Tư Toàn, TP Quy Nhơn" },
];

const ContactBtn = ({ emoji, label, bg, onClick }) => (
  <Box
    style={{
      flex: 1,
      background: bg,
      borderRadius: 12,
      padding: "12px 0",
      textAlign: "center",
      cursor: "pointer",
    }}
    onClick={onClick}
  >
    <Text style={{ fontSize: 20, display: "block", marginBottom: 4 }}>{emoji}</Text>
    <Text style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{label}</Text>
  </Box>
);

const Footer = () => (
  <Box style={{ background: "#111E2E", marginTop: 8, paddingBottom: 40 }}>
    {/* Brand header */}
    <Box
      style={{
        background: "linear-gradient(135deg, #1A2535, #1D4E6B)",
        padding: "20px 16px 18px",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
        🏨 Mira Hotels Quy Nhơn
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
        Hệ thống khách sạn ven biển · Quy Nhơn, Bình Định
      </Text>
    </Box>

    <Box style={{ padding: "18px 16px 0" }}>
      {/* ── Liên hệ nhanh ── */}
      <Text
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Liên hệ nhanh
      </Text>

      <Box style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <ContactBtn
          emoji="📞"
          label="Gọi ngay"
          bg="#1D7FA3"
          onClick={() => handleCall(PHONE)}
        />
        <ContactBtn
          emoji="💬"
          label="Chat Zalo"
          bg="#0068FF"
          onClick={() => handleCall(ZALO_PHONE)}
        />
        <ContactBtn
          emoji="👍"
          label="Facebook"
          bg="#1877F2"
          onClick={() => window.open(FB_PAGE)}
        />
      </Box>

      {/* Hotline display */}
      <Box
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => handleCall(PHONE)}
      >
        <Box>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
            Hotline / Zalo
          </Text>
          <Text style={{ color: "#C9A84C", fontSize: 16, fontWeight: 700 }}>
            {PHONE_DISPLAY}
          </Text>
        </Box>
        <Text style={{ fontSize: 22 }}>📲</Text>
      </Box>

      {/* ── Địa chỉ chi nhánh ── */}
      <Text
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Địa chỉ các chi nhánh
      </Text>

      {HOTELS.map((h, i) => (
        <Box
          key={h.name}
          style={{
            display: "flex",
            gap: 10,
            paddingBottom: 10,
            marginBottom: 10,
            borderBottom:
              i < HOTELS.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          <Text style={{ color: "#C9A84C", fontSize: 12, flexShrink: 0, marginTop: 2 }}>
            ◆
          </Text>
          <Box>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              {h.name}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 1 }}>
              📍 {h.addr}
            </Text>
          </Box>
        </Box>
      ))}

      {/* Copyright */}
      <Text
        style={{
          color: "rgba(255,255,255,0.2)",
          fontSize: 10,
          textAlign: "center",
          marginTop: 16,
          paddingTop: 12,
          borderTop: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        © 2026 Mira Hotels Quy Nhơn · miraquynhon.com
      </Text>
    </Box>
  </Box>
);

export default Footer;
