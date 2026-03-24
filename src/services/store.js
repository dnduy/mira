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
}));
