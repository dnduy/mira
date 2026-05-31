# 🚀 ĐỀ XUẤT CẢI TIẾN & NÂNG CAO — Mira Quy Nhơn Zalo Mini App

> Đánh giá tổng thể: Dự án **đã rất tốt** — kiến trúc rõ ràng (pages/components/
> services/utils), lazy load, skeleton, deep link, share, loyalty, OA connect.
> Code sạch, comment tiếng Việt dễ bảo trì. Dưới đây là hướng nâng lên "pro".

---

## A. UX/UI — THÂN THIỆN & NỔI BẬT

### A1. Thumb-zone & điều hướng dưới đáy ✅ (đã làm)
- BottomNav 4 tab + nút "Đặt phòng" nổi giữa.
- BottomBar (quay lại + CTA) cho trang con — tay cầm điện thoại 1 tay vẫn bấm được.
- FloatingContact nên dời lên `bottom: 140px` để không đè BottomNav.

### A2. Tìm kiếm & lọc thông minh
- Thêm thanh **Search** ở trang Hotels: lọc theo tên, giá, view (biển/hồ), sức chứa.
- Filter hiện tại lọc theo `h.tag` nhưng tag không khớp các giá trị FILTERS
  ("Gần biển nhất", "3 Sao"...) → nhiều filter ra rỗng. Nên lọc theo thuộc tính
  thật (`stars`, `priceFrom`, `dist`) thay vì so `tag` string.

### A3. So sánh phòng / khách sạn
- Cho phép chọn 2-3 phòng và xem bảng so sánh (giá, diện tích, view, sức chứa).
- Tăng tỷ lệ chốt đơn cho khách phân vân giữa các chi nhánh.

### A4. Bộ chọn ngày tốt hơn
- `<Input type="date">` trên Zalo render kém đồng nhất. Cân nhắc dùng
  `DatePicker` của zmp-ui hoặc 1 lịch range picker hiển thị **số đêm + tổng giá tạm tính**.

### A5. Hiển thị giá động & ưu đãi
- Badge "Giảm 10% đặt sớm", "Còn 2 phòng" tạo cảm giác khan hiếm (FOMO).
- Tính & hiện **tổng tiền tạm tính** = giá phòng × số đêm ngay trong form booking.

### A6. Trạng thái rỗng & lỗi nhất quán
- Đã có error-box ở home/hotels — chuẩn hoá thành 1 component `<EmptyState>` + `<ErrorState>` tái sử dụng.

### A7. Micro-interaction
- Skeleton đã tốt. Thêm haptic feedback (`vibrate` SDK) khi đặt phòng thành công.
- Animation chuyển trang đã có (AnimationRoutes). Thêm hiệu ứng "thêm vào yêu thích".

### A8. Yêu thích (Wishlist)
- Nút ♡ lưu phòng/khách sạn vào `nativeStorage`, xem lại ở tab riêng.
- Giữ chân người dùng quay lại app.

---

## B. SEO & KHẢ NĂNG TIẾP CẬN

> Lưu ý: Zalo Mini App KHÔNG được Google index như web thường. "SEO" ở đây gồm:
> (1) SEO trong hệ sinh thái Zalo, (2) SEO cho website miraquynhon.com nguồn dữ liệu,
> (3) chuẩn hoá metadata để share link đẹp.

### B1. SEO trong Zalo
- **Tên & mô tả Mini App** chứa từ khoá: "khách sạn Quy Nhơn", "đặt phòng biển Quy Nhơn",
  "khách sạn gần biển Bình Định". (Đã có trong app.config.js — tốt.)
- Đăng ký Mini App vào **Zalo Mini App Store** đúng category Du lịch & Khách sạn.
- Tối ưu **Zalo OA**: bài viết OA gắn link mở Mini App (zalo deep link) → tăng traffic.

### B2. SEO website nguồn (miraquynhon.com)
- Trang Mira Sun mới: meta description đã có ✓. Bổ sung **Schema.org Hotel**
  (JSON-LD: name, address, priceRange, starRating, image, geo) cho từng chi nhánh
  → hiển thị rich result + Google Hotel.
- Thêm **alt text** mô tả ảnh phòng (vd "Phòng Twin Lake View 36m² view hồ sinh thái Mira Sun Quy Nhơn").
- Internal link: trang chi nhánh ↔ trang phòng ↔ bài Khám phá liên quan.
- Tốc độ: ảnh phòng đang full-size (1920×1280). Phục vụ WebP + responsive srcset.

### B3. Open Graph cho share link
- README ghi đã thêm OG tags (giai đoạn 3 ngày 24/03). Đảm bảo mỗi share dùng
  `getShareableLink` kèm `thumb` ảnh phòng → preview đẹp khi gửi Zalo/Facebook.
- Deep link `?hotelId=8&roomId=msun-suite` đã hỗ trợ ✓ — test kỹ trên Mira Sun.

### B4. Đa ngôn ngữ (inbound tourism)
- Khách Hàn/Anh là thị trường mạnh ở miền Trung. Thêm i18n (vi/en/ko):
  tối thiểu tên phòng, nút CTA, mô tả ngắn. Tăng tiếp cận khách quốc tế.

---

## C. HIỆU NĂNG & KỸ THUẬT

### C1. Tách dữ liệu khách sạn ra JSON/API
- `HOTELS_STATIC` ~1000 dòng nằm trong `api.js` → khó bảo trì khi có 8+ chi nhánh.
- Đề xuất: tạo WP REST endpoint `/mira/v1/hotels` đọc từ CPT/ACF, app fetch + cache
  `nativeStorage` (TTL 24h). Cập nhật giá/phòng không cần build lại app.
- Trước mắt: tách thành `src/data/hotels.js` riêng, import vào api.js.

### C2. Cache ảnh & dữ liệu
- Lần đầu fetch hotels → lưu nativeStorage, mở app lần sau hiện ngay (offline-first).

### C3. Validation form mạnh hơn
- Regex SĐT hiện `/^(0|\+84)\d{9}$/` — `+84` + 9 số = thiếu 1 số với đầu 84.
  Nên: `/^(0\d{9}|\+84\d{9})$/` và chuẩn hoá trước khi gửi.

### C4. Bảo mật endpoint
- `/booking` và `/user-connect` đang `permission_callback => __return_true` (public).
  Nên thêm: rate limit (Cloudflare/nonce), honeypot field chống spam bot,
  hoặc verify Zalo signature. Tránh spam đơn ảo.

### C5. Refresh OA token tự động
- README mô tả cron refresh token 80 ngày nhưng plugin chưa implement hàm
  `mira_do_refresh_zalo_token`. Cần hoàn thiện để OA notification không chết sau 90 ngày.

### C6. Theo dõi & phân tích
- Tích hợp Zalo Analytics / GA4 đo: lượt mở, lượt xem phòng, tỷ lệ chốt booking,
  chi nhánh được xem nhiều nhất → tối ưu marketing.

---

## D. TÍNH NĂNG GIÚP "CHỐT ĐƠN" (business impact)

| Tính năng | Tác động |
|---|---|
| Tổng giá tạm tính realtime | ↑ minh bạch, ↑ chuyển đổi |
| Badge khan hiếm "còn N phòng" | ↑ FOMO, ↑ urgency |
| Mã giảm giá / voucher loyalty | ↑ retention, ↑ đặt lại |
| Đánh giá khách thật (reviews) | ↑ tin tưởng (social proof) |
| Chat OA tư vấn realtime | ↑ chốt khách phân vân |
| Lịch sử đặt phòng của tôi | ↑ tiện lợi đặt lại |
| So sánh chi nhánh | ↑ giữ khách trong app |

---

## E. ƯU TIÊN TRIỂN KHAI (roadmap gợi ý)

**Sprint 1 (ngay):** Thêm Mira Sun ✅ · Sửa 3 lỗi nặng (PHP, JSX `}}`, route trùng) ·
BottomNav + BottomBar ✅ · Cập nhật "8 khách sạn".

**Sprint 2:** Search + filter đúng thuộc tính · Tổng giá tạm tính · Schema Hotel cho website.

**Sprint 3:** Wishlist · Lịch sử đặt phòng · Cache offline · GA4.

**Sprint 4:** i18n (vi/en/ko) · So sánh phòng · Voucher loyalty · Hoàn thiện cron refresh token.
