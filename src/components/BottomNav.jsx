import React from "react";
import { Box, Text } from "zmp-ui";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Thanh điều hướng cố định dưới đáy màn hình (bottom tab bar).
 * Thay thế tabBar mặc định của Zalo để đồng bộ brand vàng/navy + safe-area iPhone.
 *
 * Hiển thị trên các trang gốc (Trang chủ, Khách sạn, Đặt phòng, Khám phá).
 */
const TABS = [
  {
    path: "/",
    label: "Trang chủ",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V9.5"
          stroke={active ? "#C9A84C" : "#9AA5B1"} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: "/hotels",
    label: "Khách sạn",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h3a1 1 0 011 1v11M8 7h2M8 11h2M8 15h2"
          stroke={active ? "#C9A84C" : "#9AA5B1"} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: "/booking",
    label: "Đặt phòng",
    primary: true, // nút nổi giữa
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zM9 14l2 2 4-4"
          stroke="#1A2535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: "/explore",
    label: "Khám phá",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#C9A84C" : "#9AA5B1"} strokeWidth="2" />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"
          stroke={active ? "#C9A84C" : "#9AA5B1"} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  return (
    <Box
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9980,
        background: "#ffffff",
        borderTop: "0.5px solid #ececec",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-around",
        height: 64,
        paddingTop: 8,
        // Safe-area cho iPhone (tai thỏ / home indicator)
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map((tab) => {
        const active = current === tab.path;

        if (tab.primary) {
          // Nút "Đặt phòng" nổi giữa, tròn vàng
          return (
            <Box
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Box
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #D4A843, #C9A84C, #A8893A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -22,
                  boxShadow: "0 4px 14px rgba(201,168,76,0.5)",
                  border: "3px solid #fff",
                }}
              >
                {tab.icon(true)}
              </Box>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 600,
                  color: active ? "#C9A84C" : "#7F8C8D",
                  marginTop: 2,
                }}
              >
                {tab.label}
              </Text>
            </Box>
          );
        }

        return (
          <Box
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {tab.icon(active)}
            <Text
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? "#C9A84C" : "#9AA5B1",
              }}
            >
              {tab.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default BottomNav;
