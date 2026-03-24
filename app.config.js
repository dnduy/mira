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
  tabBar: {
    custom: false,
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    selectedColor: "#C9A84C",
    unselectedColor: "#7F8C8D",
    list: [
      {
        pagePath: "pages/home/index",
        text: "Trang chủ",
        icon: "assets/icons/home.png",
        selectedIcon: "assets/icons/home-active.png",
      },
      {
        pagePath: "pages/hotels/index",
        text: "Khách sạn",
        icon: "assets/icons/hotel.png",
        selectedIcon: "assets/icons/hotel-active.png",
      },
      {
        pagePath: "pages/booking/index",
        text: "Đặt phòng",
        icon: "assets/icons/booking.png",
        selectedIcon: "assets/icons/booking-active.png",
      },
      {
        pagePath: "pages/explore/index",
        text: "Khám phá",
        icon: "assets/icons/explore.png",
        selectedIcon: "assets/icons/explore-active.png",
      },
    ],
  },
};
