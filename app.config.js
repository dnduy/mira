export default {
  app: {
    title: "Mira Quy Nhơn - Khách sạn 5 sao biển, Đặt phòng nhanh",
    description:
      "Đặt phòng khách sạn Mira Quy Nhơn 5 sao view biển trực tiếp trên Zalo. Giá tốt nhất, ưu đãi flash sale, hồ bơi vô cực, nhà hàng hải sản tươi sống. Hỗ trợ Zalo Pay, nhận phòng nhanh, hoàn tiền dễ dàng. Khách sạn biển Quy Nhơn đẹp nhất.",
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
