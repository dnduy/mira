import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App, ZMPRouter, Route, AnimationRoutes, SnackbarProvider } from "zmp-ui";
import "zmp-ui/zaui.css";
import FloatingContact from "./components/FloatingContact";
import { useAppStore } from "./services/store";

// Lazy load tất cả pages — mỗi page chỉ tải khi user điều hướng đến
const HomePage       = lazy(() => import("./pages/home"));
const HotelsPage     = lazy(() => import("./pages/hotels"));
const HotelDetailPage = lazy(() => import("./pages/hotel-detail"));
const BookingPage    = lazy(() => import("./pages/booking"));
const ExplorePage    = lazy(() => import("./pages/explore"));
const PostDetailPage = lazy(() => import("./pages/post-detail"));
const RoomDetailPage = lazy(() => import("./pages/room-detail"));

// Fallback hiển thị trong khi chunk đang tải
const PageLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#F5F0E8",
  }}>
    <div style={{
      width: 36,
      height: 36,
      border: "3px solid #e0d8c8",
      borderTopColor: "#C9A84C",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
            <AnimationRoutes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotel/:id" element={<HotelDetailPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/post/:id" element={<PostDetailPage />} />
              <Route path="/hotel/:hotelId/room/:roomId" element={<RoomDetailPage />} />
            </AnimationRoutes>
          </Suspense>
        </ZMPRouter>
        <FloatingContact />
      </SnackbarProvider>
    </App>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<MyApp />);

export default MyApp;
