/**
 * Modal kêu gọi đánh giá app sau khi đặt phòng thành công.
 * Dùng requestReview từ zmp-sdk để mở hộp thoại đánh giá native của Zalo.
 * Fallback: không làm gì nếu SDK không hỗ trợ (tránh crash).
 */
import React from "react";
import { Box, Text, Button } from "zmp-ui";
import { requestReview } from "zmp-sdk/apis";

const ReviewModal = ({ onClose }) => {
  // Gọi hộp thoại đánh giá native Zalo
  const handleReview = async () => {
    try {
      await requestReview();
    } catch {
      // requestReview không hỗ trợ trên thiết bị này — bỏ qua
    } finally {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "flex-end",
        }}
        onClick={onClose}
      >
        {/* Modal card — ngăn click bubble lên backdrop */}
        <Box
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            padding: "28px 24px 36px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon ngôi sao */}
          <Text style={{ fontSize: 52, lineHeight: 1, marginBottom: 12, display: "block" }}>
            ⭐
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1A2535",
              marginBottom: 10,
              display: "block",
            }}
          >
            Bạn thấy Mira App thế nào?
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: "#7F8C8D",
              lineHeight: 1.6,
              marginBottom: 24,
              display: "block",
            }}
          >
            Đánh giá 5 sao giúp nhiều du khách tìm thấy Mira Quy Nhơn dễ hơn.{"\n"}
            Chỉ mất 5 giây thôi! 🙏
          </Text>

          {/* Nút đánh giá */}
          <Button
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #C9A84C, #A8893A)",
              color: "#1A2535",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 15,
              height: 50,
              marginBottom: 12,
            }}
            onClick={handleReview}
          >
            ⭐ Đánh giá ngay
          </Button>

          {/* Bỏ qua */}
          <Button
            variant="secondary"
            style={{
              width: "100%",
              borderRadius: 14,
              height: 44,
              fontSize: 14,
              color: "#7F8C8D",
              border: "none",
              background: "transparent",
            }}
            onClick={onClose}
          >
            Để sau
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ReviewModal;
