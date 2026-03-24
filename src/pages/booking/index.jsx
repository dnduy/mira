import React, { useState } from "react";
import { Page, Box, Text, Button, Input, Select, Picker, useSnackbar } from "zmp-ui";
import { handleCall, handleOpenChat } from "../../utils/contact";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import { wpApi } from "../../services/api";
import ReviewModal from "../../components/ReviewModal";
import dayjs from "dayjs";

const HOTEL_OPTIONS = [
  { value: "mira-quy-nhon",  label: "Mira Hotel Quy Nhơn (100m biển)" },
  { value: "mira-boutique",  label: "Mira Boutique Hotel" },
  { value: "mira-grand",     label: "Mira Grand" },
  { value: "mira-bai-xep",   label: "Mira Bãi Xếp (Homestay)" },
  { value: "mira-aloha",     label: "Mira Aloha" },
  { value: "mira-eco",       label: "Mira Eco (50m biển)" },
  { value: "xavia-hotel",    label: "Xavia Hotel" },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { bookingForm, setBookingField, resetBookingForm, user } = useAppStore();
  const [loading, setLoading] = useState(false);
  // Hiện popup đánh giá sau khi đặt phòng thành công
  const [showReview, setShowReview] = useState(false);

  const today = dayjs().format("YYYY-MM-DD");
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

  const validate = () => {
    if (!bookingForm.hotelId) {
      openSnackbar({ text: "Vui lòng chọn khách sạn", type: "error" });
      return false;
    }
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      openSnackbar({ text: "Vui lòng chọn ngày nhận/trả phòng", type: "error" });
      return false;
    }
    if (!bookingForm.name.trim()) {
      openSnackbar({ text: "Vui lòng nhập họ tên", type: "error" });
      return false;
    }
    if (!bookingForm.phone.trim() || !/^(0|\+84)\d{9}$/.test(bookingForm.phone)) {
      openSnackbar({ text: "Số điện thoại không hợp lệ", type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await wpApi.submitBooking({
        ...bookingForm,
        zaloUserId: user?.id || null,
        zaloName: user?.name || null,
        submittedAt: new Date().toISOString(),
      });
      openSnackbar({
        text: "✓ Đặt phòng thành công! Mira sẽ liên hệ bạn sớm.",
        type: "success",
        duration: 4000,
      });
      resetBookingForm();
      // Hiện popup kêu gọi đánh giá sau 1.5s để snackbar hiển trước
      setTimeout(() => setShowReview(true), 1500);
    } catch (err) {
      openSnackbar({
        text: "Lỗi gửi đặt phòng. Vui lòng gọi trực tiếp 0256 XXX XXXX",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* Popup đánh giá app sau khi đặt phòng thành công */}
      {showReview && (
        <ReviewModal onClose={() => { setShowReview(false); navigate("/"); }} />
      )}
      {/* Header */}
      <Box
        style={{
          background: "linear-gradient(135deg, #1A2535, #1D4E6B)",
          padding: "20px 16px 28px",
        }}
      >
        <Text style={{ color: "#C9A84C", fontSize: 13, marginBottom: 4 }}>
          Đặt phòng trực tiếp
        </Text>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
          Giá tốt nhất đảm bảo
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>
          Không thu phí đặt cọc · Hủy miễn phí trước 24h
        </Text>
      </Box>

      <Box style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Chọn khách sạn */}
        <Box className="form-group">
          <Text className="form-label">Chọn khách sạn *</Text>
          <Select
            placeholder="Vui lòng chọn khách sạn"
            value={bookingForm.hotelId}
            onChange={(val) => {
              const hotel = HOTEL_OPTIONS.find((h) => h.value === val);
              setBookingField("hotelId", val);
              setBookingField("hotelName", hotel?.label || "");
            }}
          >
            {HOTEL_OPTIONS.map((h) => (
              <Select.Option key={h.value} value={h.value} title={h.label} />
            ))}
          </Select>
        </Box>

        {/* Ngày */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Box className="form-group">
            <Text className="form-label">Ngày nhận phòng *</Text>
            <Input
              type="date"
              value={bookingForm.checkIn || today}
              min={today}
              onChange={(e) => setBookingField("checkIn", e.target.value)}
            />
          </Box>
          <Box className="form-group">
            <Text className="form-label">Ngày trả phòng *</Text>
            <Input
              type="date"
              value={bookingForm.checkOut || tomorrow}
              min={bookingForm.checkIn || tomorrow}
              onChange={(e) => setBookingField("checkOut", e.target.value)}
            />
          </Box>
        </Box>

        {/* Số người */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Box className="form-group">
            <Text className="form-label">Người lớn</Text>
            <Select
              value={String(bookingForm.adults)}
              onChange={(v) => setBookingField("adults", parseInt(v))}
            >
              {[1,2,3,4,5,6].map((n) => (
                <Select.Option key={n} value={String(n)} title={`${n} người`} />
              ))}
            </Select>
          </Box>
          <Box className="form-group">
            <Text className="form-label">Trẻ em</Text>
            <Select
              value={String(bookingForm.children)}
              onChange={(v) => setBookingField("children", parseInt(v))}
            >
              {[0,1,2,3].map((n) => (
                <Select.Option key={n} value={String(n)} title={`${n} trẻ em`} />
              ))}
            </Select>
          </Box>
        </Box>

        {/* Họ tên */}
        <Box className="form-group">
          <Text className="form-label">Họ và tên *</Text>
          <Input
            placeholder="Nhập họ và tên đầy đủ"
            value={bookingForm.name}
            onChange={(e) => setBookingField("name", e.target.value)}
          />
        </Box>

        {/* SĐT */}
        <Box className="form-group">
          <Text className="form-label">Số điện thoại *</Text>
          <Input
            type="tel"
            placeholder="0901 234 567"
            value={bookingForm.phone}
            onChange={(e) => setBookingField("phone", e.target.value)}
          />
        </Box>

        {/* Ghi chú */}
        <Box className="form-group">
          <Text className="form-label">Yêu cầu đặc biệt</Text>
          <Input
            type="textarea"
            placeholder="VD: phòng tầng cao, view biển, giường đôi..."
            value={bookingForm.note}
            onChange={(e) => setBookingField("note", e.target.value)}
            showCount
            maxLength={200}
          />
        </Box>

        {/* Submit */}
        <Button
          loading={loading}
          disabled={loading}
          style={{
            background: "#C9A84C",
            color: "#1A2535",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            height: 50,
            marginTop: 4,
          }}
          onClick={handleSubmit}
        >
          {loading ? "Đang gửi..." : "Gửi yêu cầu đặt phòng"}
        </Button>

        {/* Liên hệ trực tiếp */}
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Button
            variant="secondary"
            style={{ borderRadius: 12, height: 44, fontSize: 13 }}
            onClick={() => handleCall("02563821234")}
          >
            📞 Gọi trực tiếp
          </Button>
          <Button
            variant="secondary"
            style={{ borderRadius: 12, height: 44, fontSize: 13 }}
            onClick={() => handleOpenChat()}
          >
            💬 Chat Zalo OA
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default BookingPage;
