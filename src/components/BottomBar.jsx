import React from "react";
import { Box, Text } from "zmp-ui";
import { useNavigate } from "react-router-dom";

/**
 * Thanh điều khiển cố định DƯỚI ĐÁY màn hình cho các trang con.
 * Chứa nút "Quay lại" to, dễ bấm bằng ngón cái — thay cho BackBar trên đầu.
 *
 * @param {string}   to        - Route đích khi bấm quay lại (mặc định: navigate(-1))
 * @param {ReactNode} action   - Nút hành động phụ bên phải (vd: nút Đặt phòng / Chia sẻ)
 * @param {string}   actionLabel - Nhãn nút hành động chính (nếu dùng onAction)
 * @param {function} onAction  - Callback nút hành động chính
 */
const BottomBar = ({ to = null, action = null, actionLabel = null, onAction = null }) => {
  const navigate = useNavigate();

  return (
    <Box
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9970,
        background: "#ffffff",
        borderTop: "0.5px solid #ececec",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Nút quay lại */}
      <button
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label="Quay lại"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 48,
          padding: "0 20px",
          borderRadius: 14,
          border: "1.5px solid #e0d8c8",
          background: "#F7F3EA",
          cursor: "pointer",
          flex: actionLabel || action ? "0 0 auto" : 1,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#1A2535" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <Text style={{ fontSize: 15, fontWeight: 700, color: "#1A2535" }}>Quay lại</Text>
      </button>

      {/* Nút hành động chính (tuỳ chọn) */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #D4A843, #C9A84C, #A8893A)",
            color: "#1A2535",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {actionLabel}
        </button>
      )}

      {/* Slot action tuỳ ý (vd: nút chia sẻ icon) */}
      {action}
    </Box>
  );
};

export default BottomBar;
