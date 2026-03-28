import { create } from "zustand";
import { getUserInfo, nativeStorage } from "zmp-sdk/apis";
import { wpApi } from "./api";

export const useAppStore = create((set, get) => ({
  // ─── User State ───────────────────────────────────────────
  user: null,
  zaloUserId: null,

  initUser: async () => {
    try {
      const { userInfo } = await getUserInfo({});
      set({
        user: {
          name: userInfo.name,
          avatar: userInfo.avatar,
        },
        zaloUserId: userInfo.id,
      });
    } catch (err) {
      console.warn("Không lấy được user info:", err);
    }
  },

  // ─── Hotels State ─────────────────────────────────────────
  hotels: [],
  hotelsLoading: false,
  hotelsError: null,

  fetchHotels: async () => {
    set({ hotelsLoading: true, hotelsError: null });
    try {
      const data = await wpApi.getHotels();
      set({ hotels: data, hotelsLoading: false });
    } catch (err) {
      set({ hotelsError: err.message, hotelsLoading: false });
    }
  },

  // ─── Hotel Detail ─────────────────────────────────────────
  currentHotel: null,

  fetchHotelDetail: async (id) => {
    set({ currentHotel: null });
    try {
      const data = await wpApi.getHotelDetail(id);
      set({ currentHotel: data });
    } catch (err) {
      console.error("Lỗi load hotel detail:", err);
    }
  },

  // ─── Explore Posts ────────────────────────────────────────
  explorePosts: [],
  exploreLoading: false,

  fetchExplorePosts: async () => {
    set({ exploreLoading: true });
    try {
      const data = await wpApi.getExplorePosts();
      set({ explorePosts: data, exploreLoading: false });
    } catch (err) {
      set({ exploreLoading: false });
    }
  },

  // ─── Post Detail ──────────────────────────────────────────
  currentPost: null,
  postLoading: false,

  fetchPostDetail: async (id) => {
    set({ postLoading: true, currentPost: null });
    try {
      const data = await wpApi.getPostDetail(id);
      set({ currentPost: data, postLoading: false });
    } catch (err) {
      console.error("Lỗi load post detail:", err);
      set({ postLoading: false });
    }
  },

  // ─── Booking ──────────────────────────────────────────────
  bookingForm: {
    hotelId: null,
    hotelName: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    name: "",
    phone: "",
    note: "",
  },

  setBookingField: (field, value) =>
    set((state) => ({
      bookingForm: { ...state.bookingForm, [field]: value },
    })),

  resetBookingForm: () =>
    set({
      bookingForm: {
        hotelId: null,
        hotelName: "",
        checkIn: "",
        checkOut: "",
        adults: 2,
        children: 0,
        name: "",
        phone: "",
        note: "",
      },
    }),

  // ─── Loyalty Points ───────────────────────────────────────
  loyaltyPoints: 0,

  /** Đọc điểm tích luỹ từ nativeStorage (gọi khi app khởi động). */
  loadPoints: () => {
    try {
      const saved = nativeStorage.getItem("mira_loyalty_points");
      const val = saved ? parseInt(saved, 10) : 0;
      set({ loyaltyPoints: isNaN(val) ? 0 : val });
    } catch {
      set({ loyaltyPoints: 0 });
    }
  },

  /** Cộng điểm sau khi đặt phòng thành công và lưu lại. */
  addPoints: (n) => {
    const prev = (get().loyaltyPoints || 0);
    const next = prev + n;
    set({ loyaltyPoints: next });
    try {
      nativeStorage.setItem("mira_loyalty_points", String(next));
    } catch {
      // bỏ qua lỗi storage
    }
  },

  // ─── OA Connection ─────────────────────────────────────
  isOAConnected: false,
  zaloUserInfo: null,
  connectSkipCount: 0,

  /** Đọc trạng thái kết nối OA từ nativeStorage (gọi khi app khởi động). */
  loadUserConnection: () => {
    try {
      const connected = nativeStorage.getItem("mira_oa_connected");
      const skipRaw   = nativeStorage.getItem("mira_connect_skip_count");
      const skipUntilRaw = nativeStorage.getItem("mira_connect_skip_until");
      const skipCount = skipRaw ? parseInt(skipRaw, 10) : 0;
      const skipUntil = skipUntilRaw ? parseInt(skipUntilRaw, 10) : 0;
      let userInfo = null;
      try {
        const raw = nativeStorage.getItem("mira_oa_user_info");
        if (raw) userInfo = JSON.parse(raw);
      } catch { /* bỏ qua */ }
      set({
        isOAConnected: connected === "1",
        connectSkipCount: isNaN(skipCount) ? 0 : skipCount,
        _connectSkipUntil: isNaN(skipUntil) ? 0 : skipUntil,
        zaloUserInfo: userInfo,
      });
    } catch {
      // bỏ qua lỗi storage
    }
  },

  /** Lưu thông tin user sau khi kết nối thành công. */
  setUserConnected: (userInfo) => {
    set({ isOAConnected: true, zaloUserInfo: userInfo });
    try {
      nativeStorage.setItem("mira_oa_connected", "1");
      nativeStorage.setItem("mira_oa_user_info", JSON.stringify(userInfo));
    } catch { /* bỏ qua */ }
  },

  /** Tăng số lần bỏ qua; nếu >= 2, khóa modal trong 7 ngày. */
  incrementSkipCount: () => {
    const prev = get().connectSkipCount || 0;
    const next = prev + 1;
    set({ connectSkipCount: next });
    try {
      nativeStorage.setItem("mira_connect_skip_count", String(next));
      if (next >= 2) {
        const until = Date.now() + 7 * 24 * 60 * 60 * 1000;
        set({ _connectSkipUntil: until });
        nativeStorage.setItem("mira_connect_skip_until", String(until));
      }
    } catch { /* bỏ qua */ }
  },

  /** Kiểm tra có nên hiển thị modal kết nối không. */
  shouldShowConnectModal: () => {
    const state = get();
    if (state.isOAConnected) return false;
    if (state.connectSkipCount >= 2) {
      const until = state._connectSkipUntil || 0;
      if (Date.now() < until) return false;
      // Hết thời gian khóa — reset counter
      set({ connectSkipCount: 0, _connectSkipUntil: 0 });
      try {
        nativeStorage.setItem("mira_connect_skip_count", "0");
        nativeStorage.removeItem("mira_connect_skip_until");
      } catch { /* bỏ qua */ }
    }
    return true;
  },
}));
