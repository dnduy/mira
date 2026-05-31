import React, { useEffect, lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App, ZMPRouter, Route, AnimationRoutes, SnackbarProvider, useNavigate } from "zmp-ui";
import { useLocation } from "react-router-dom";
import "zmp-ui/zaui.css";
import FloatingContact from "./components/FloatingContact";
import BottomNav from "./components/BottomNav";
import { useAppStore } from "./services/store";
import { retryPendingConnect } from "./utils/zaloConnect";

// Suppress React Router v6 future flag warnings — ZMPRouter wraps BrowserRouter
// internally và không expose future prop, sẽ tự hết khi zmp-ui upgrade lên RR v7
if (import.meta.env.DEV) {
  const _warn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("React Router Future Flag Warning")) return;
    _warn(...args);
  };
}

// Lazy load tất cả pages — mỗi page chỉ tải khi user điều hướng đến
const HomePage        = lazy(() => import("./pages/home"));
const HotelsPage      = lazy(() => import("./pages/hotels"));
const HotelDetailPage = lazy(() => import("./pages/hotel-detail"));
const BookingPage     = lazy(() => import("./pages/booking"));
const ExplorePage     = lazy(() => import("./pages/explore"));
const PostDetailPage  = lazy(() => import("./pages/post-detail"));
const RoomDetailPage  = lazy(() => import("./pages/room-detail"));

// Các trang gốc hiển thị BottomNav
const ROOT_PATHS = ["/", "/hotels", "/booking", "/explore"];

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

/**
 * Xử lý deep link khi app được mở từ link chia sẻ.
 */
const DeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hotelId = params.get("hotelId");
    const roomId  = params.get("roomId");
    const postId  = params.get("postId");

    if (hotelId && roomId) {
      navigate(`/hotel/${hotelId}/room/${roomId}`);
    } else if (hotelId) {
      navigate(`/hotel/${hotelId}`);
    } else if (postId) {
      navigate(`/post/${postId}`);
    }
  }, []);

  return null;
};

/** Chỉ hiển thị BottomNav khi đang ở trang gốc */
const ConditionalBottomNav = () => {
  const location = useLocation();
  return ROOT_PATHS.includes(location.pathname) ? <BottomNav /> : null;
};

const MyApp = () => {
  const { initUser, loadPoints, loadUserConnection } = useAppStore();

  useEffect(() => {
    initUser();
    loadPoints();
    loadUserConnection();
    retryPendingConnect();
  }, []);

  return (
    <App>
      <SnackbarProvider>
        <ZMPRouter>
          <DeepLinkHandler />
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
          <ConditionalBottomNav />
        </ZMPRouter>
        <FloatingContact />
      </SnackbarProvider>
    </App>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(<MyApp />);

export default MyApp;
