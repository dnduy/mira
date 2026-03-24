import React from "react";
import { Box, Text } from "zmp-ui";
import { useNavigate } from "react-router-dom";

/**
 * Thanh quay lại cố định ở đầu trang — to, dễ bấm trên mobile.
 * @param {string}   title    - Tiêu đề hiển thị (tuỳ chọn)
 * @param {string}   to       - Route cụ thể để về (mặc định: -1 = back)
 * @param {string}   bg       - Background màu (mặc định: trắng)
 * @param {boolean}  light    - true = text/icon màu trắng (dùng trên hero tối)
 */
const BackBar = ({ title = "", to = null, bg = "#fff", light = false }) => {
  const navigate = useNavigate();
  const textColor = light ? "#fff" : "#1A2535";
  const iconBg    = light ? "rgba(0,0,0,0.35)" : "#F0EDE6";

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 16px",
        height: 52,
        background: bg,
        borderBottom: light ? "none" : "0.5px solid #ececec",
        flexShrink: 0,
      }}
    >
      {/* Nút quay lại — tối thiểu 44×44 px để dễ bấm */}
      <button
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label="Quay lại"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minWidth: 44,
          minHeight: 44,
          paddingLeft: 4,
          paddingRight: 12,
          borderRadius: 22,
          border: "none",
          background: iconBg,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg
          width="20" height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={light ? "#fff" : "#1A2535"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <Text style={{ fontSize: 14, fontWeight: 600, color: light ? "#fff" : "#1A2535" }}>
          Quay lại
        </Text>
      </button>

      {title && (
        <Text
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: textColor,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Text>
      )}
    </Box>
  );
};

export default BackBar;
