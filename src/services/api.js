import axios from "axios";
import { HOTELS_STATIC } from "../data/hotels";

const WP_BASE = "https://miraquynhon.com/wp-json";
const WP_V2 = `${WP_BASE}/wp/v2`;
const MIRA_API = `${WP_BASE}/mira/v1`;

// ─── Axios instance ───────────────────────────────────────────────────────────
const wpClient = axios.create({
  baseURL: WP_V2,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const decodeEntities = (str = "") =>
  str
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");

const stripHtml = (html = "") => decodeEntities(html.replace(/<[^>]*>/g, "").trim());

// ─── API calls ────────────────────────────────────────────────────────────────
export const wpApi = {
  /**
   * Danh sách khách sạn – dùng data tĩnh vì WP không expose /loai-phong/ taxonomy qua REST
   */
  getHotels: async () => {
    return HOTELS_STATIC;
  },

  /**
   * Chi tiết khách sạn theo id (1-7)
   */
  getHotelDetail: async (id) => {
    const hotel = HOTELS_STATIC.find((h) => h.id === parseInt(id));
    return hotel || HOTELS_STATIC[0];
  },

  /**
   * Bài viết khám phá Quy Nhơn (từ WP posts categories)
   */
  getExplorePosts: async () => {
    const res = await wpClient.get("/posts", {
      params: {
        per_page: 12,
        _embed: 1,
      },
    });
    return res.data.map((post) => ({
      id: post.id,
      title: stripHtml(post.title?.rendered || ""),
      excerpt: stripHtml(post.excerpt?.rendered || ""),
      slug: post.slug,
      date: post.date,
      thumbnail:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium?.source_url ||
        null,
    }));
  },

  getPostDetail: async (id) => {
    const res = await wpClient.get(`/posts/${id}`, {
      params: { _embed: 1 },
    });
    const post = res.data;
    return {
      id: post.id,
      title: stripHtml(post.title?.rendered || ""),
      content: post.content?.rendered || "",
      excerpt: stripHtml(post.excerpt?.rendered || ""),
      slug: post.slug,
      date: post.date,
      thumbnail:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      category: post._embedded?.["wp:term"]?.[0]?.[0]?.name || null,
    };
  },

  /**
   * Gửi đặt phòng đến custom WP REST endpoint
   * (cần cài wordpress-plugin/mira-booking-api.php)
   */
  submitBooking: async (formData) => {
    const res = await axios.post(`${MIRA_API}/booking`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
};
