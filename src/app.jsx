import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { App, ZMPRouter, Route, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import "zmp-ui/zaui.css";
import HomePage from "./pages/home";
import HotelsPage from "./pages/hotels";
import HotelDetailPage from "./pages/hotel-detail";
import BookingPage from "./pages/booking";
import ExplorePage from "./pages/explore";
import PostDetailPage from "./pages/post-detail";
import RoomDetailPage from "./pages/room-detail";
import FloatingContact from "./components/FloatingContact";
import { useAppStore } from "./services/store";

const MyApp = () => {
  const { initUser } = useAppStore();

  useEffect(() => {
    // Lấy thông tin user Zalo khi app khởi động
    initUser();
  }, []);

  return (
    <App>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotel/:id" element={<HotelDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/hotel/:hotelId/room/:roomId" element={<RoomDetailPage />} />
          </AnimationRoutes>
        </ZMPRouter>
        <FloatingContact />
      </SnackbarProvider>
    </App>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<MyApp />);

export default MyApp;
