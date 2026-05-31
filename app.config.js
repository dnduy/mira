export default {
  app: {
    title: "Mira Quy Nhơn — Hệ thống khách sạn biển, đặt phòng nhanh",
    description:
      "Đặt phòng 8 khách sạn Mira Quy Nhơn ngay trên Zalo: gần biển & view Hồ Sinh Thái. " +
      "Giá tốt, xác nhận nhanh, không thu phí đặt cọc, hỗ trợ chỉ đường & chat OA.",
    icon: "https://miraquynhon.com/wp-content/uploads/2024/10/logo.png",
  },
  pages: [
    "pages/home/index",
    "pages/hotels/index",
    "pages/hotel-detail/index",
    "pages/booking/index",
    "pages/explore/index",
  ],
  window: {
    backgroundColor: "#F5F0E8",
    navigationBarBackgroundColor: "#1A2535",
    navigationBarTextStyle: "white",
    navigationBarTitleText: "Mira Quy Nhơn 🏖️",
  },
  // tabBar mặc định Zalo đã tắt — dùng BottomNav custom (src/components/BottomNav.jsx)
  // để tránh 2 thanh điều hướng chồng nhau.
};
