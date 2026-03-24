# 🏨 Mira Quy Nhơn – Zalo Mini App

React + Zalo Mini App SDK cho hệ thống khách sạn miraquynhon.com

---

## 📁 Cấu trúc project

```
mira-zalo-miniapp/
├── app.config.js              # Cấu hình app (tab bar, pages, permissions)
├── package.json
├── src/
│   ├── app.js                 # Entry point
│   ├── pages/
│   │   ├── home/              # Trang chủ + danh sách KS
│   │   ├── hotels/            # Danh sách đầy đủ
│   │   ├── hotel-detail/      # Chi tiết + phòng
│   │   ├── booking/           # Form đặt phòng
│   │   └── explore/           # Khám phá Quy Nhơn
│   ├── components/
│   │   ├── HotelCard.jsx
│   │   └── LoadingSkeleton.jsx
│   └── services/
│       ├── api.js             # WP REST API calls
│       └── store.js           # Zustand global state
└── wordpress-plugin/
    └── mira-booking-api.php   # Cài vào miraquynhon.com
```

---

## 🚀 BƯỚC 1 – Cài Node.js + Zalo CLI

```bash
# Yêu cầu Node.js >= 16
node -v

# Cài Zalo Mini App CLI
npm install -g zmp-cli

# Đăng nhập tài khoản Zalo Developer
zmp login
```

---

## 🔧 BƯỚC 2 – Tạo Mini App trên Zalo Developer

1. Truy cập https://mini.zalo.me
2. Đăng nhập bằng tài khoản Zalo doanh nghiệp
3. **Tạo ứng dụng mới** → chọn "Mini App"
4. Điền:
   - Tên app: **Mira Quy Nhơn**
   - Mô tả: Hệ thống khách sạn biển Quy Nhơn
   - Category: Du lịch & Khách sạn
5. Copy **App ID** → dán vào `package.json`:
   ```json
   "zalo": {
     "miniapp": {
       "appId": "PASTE_APP_ID_HERE"
     }
   }
   ```

---

## 📦 BƯỚC 3 – Cài dependencies & chạy local

```bash
cd mira-zalo-miniapp
npm install
npm start
# → App chạy trên Zalo Dev Tool tại http://localhost:3000
```

---

## 🔑 BƯỚC 4 – Lấy Zalo OA Access Token

> Làm bước này để gửi notification về Zalo khi có đặt phòng.

1. Truy cập https://oa.zalo.me → chọn OA Mira
2. Vào **Cài đặt → Phát triển ứng dụng**
3. Lấy **OA ID** và tạo **Access Token** (v2)
4. Token có hiệu lực 90 ngày → dùng Refresh Token để tự gia hạn

**Thêm vào wp-config.php** (an toàn hơn hardcode):
```php
// Thêm vào file wp-config.php của miraquynhon.com
define( 'ZALO_OA_ACCESS_TOKEN', 'your_actual_token_here' );
```

---

## 🔌 BƯỚC 5 – Cài WordPress Plugin

1. Upload file `wordpress-plugin/mira-booking-api.php` lên:
   ```
   /wp-content/plugins/mira-booking-api/mira-booking-api.php
   ```
2. Vào **WordPress Admin → Plugins → Kích hoạt** "Mira Booking API"
3. Sửa cấu hình trong plugin:
   ```php
   define( 'MIRA_ADMIN_EMAIL', 'booking@miraquynhon.com' );
   define( 'MIRA_ZALO_OA_ID',  'your_oa_id' );
   ```
4. Test endpoint:
   ```bash
   curl https://miraquynhon.com/wp-json/mira/v1/ping
   # → {"status":"ok"}
   ```

---

## ✅ BƯỚC 6 – Test đặt phòng end-to-end

```bash
curl -X POST https://miraquynhon.com/wp-json/mira/v1/booking \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "mira-quy-nhon",
    "hotelName": "Mira Hotel Quy Nhơn",
    "checkIn": "2026-04-01",
    "checkOut": "2026-04-03",
    "adults": 2,
    "children": 0,
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "note": "Phòng tầng cao view biển"
  }'
```

Kết quả mong đợi:
- ✅ Admin nhận email tại `booking@miraquynhon.com`
- ✅ Đơn xuất hiện trong **WP Admin → Đặt phòng**
- ✅ Nếu có Zalo OA token → khách nhận tin nhắn xác nhận

---

## 🚢 BƯỚC 7 – Deploy lên Zalo

```bash
npm run build
zmp deploy
```

Sau khi deploy: Submit review tại https://mini.zalo.me để app public.

---

## 🔄 Refresh Token tự động (cron)

Thêm vào `functions.php` hoặc plugin để tự refresh Zalo OA token mỗi 80 ngày:

```php
add_action('mira_refresh_zalo_token', 'mira_do_refresh_zalo_token');
function mira_do_refresh_zalo_token() {
    $refresh_token = get_option('mira_zalo_refresh_token');
    // Gọi https://oauth.zaloapp.com/v4/oa/access_token
    // với grant_type=refresh_token
    // Xem docs: https://developers.zalo.me/docs/official-account/xac-thuc-va-uy-quyen/lam-moi-access-token
}
if ( ! wp_next_scheduled('mira_refresh_zalo_token') ) {
    wp_schedule_event( time(), 'twicemonthly', 'mira_refresh_zalo_token' );
}
```

---

## 📞 Liên hệ hỗ trợ kỹ thuật

- Zalo Developer Docs: https://developers.zalo.me/docs/mini-app
- WP REST API Docs: https://developer.wordpress.org/rest-api/
- Zalo OA Message API: https://developers.zalo.me/docs/official-account/gui-tin-nhan

---

## 📋 Nhật ký phát triển – 20/03/2026

### Giai đoạn 1 – Sửa lỗi khởi động ứng dụng

**Vấn đề:** App chạy không hiển thị gì (màn hình trắng/đen).

**Nguyên nhân & fix:**
- Thiếu file `src/index.html` → tạo lại
- File entry point dùng sai phần mở rộng `app.js` → đổi thành `app.jsx`
- `package.json` khai báo sai phiên bản `zmp-ui@^2.0.0` (không tồn tại) → sửa về `^1.11.13`
- Cài lại toàn bộ dependencies: `npm install`

---

### Giai đoạn 2 – Sửa lỗi ZMP Simulator

**Vấn đề:** Không khởi động được bằng simulator của Zalo Mini App (zmp-cli).

**Nguyên nhân & fix:**
- `zmp` không tìm thấy trong PATH → cài global: `npm install -g zmp-cli`, thêm vào `~/.zshrc`
- `zmp-cli-core` yêu cầu Vite v5 exports → nâng cấp từ Vite v4 lên **Vite v5.4.21**
- Sửa `zmp-cli.json` cho đúng cấu hình
- Sửa `tailwind.config.js` cho tương thích Tailwind v3

**Kết quả:** `zmp start` → app chạy tại `http://localhost:3000`

---

### Giai đoạn 3 – Tích hợp hình ảnh thực từ website

**Vấn đề:** App hiển thị dữ liệu giả, không có hình ảnh thực tế.

**Thay đổi:**
- `src/services/api.js`: Xây dựng mảng `HOTELS_STATIC` chứa 7 khách sạn với ảnh thực lấy từ miraquynhon.com
- Mỗi khách sạn có: `thumbnail`, `images[]` (gallery), `addr`, `dist`, `priceFrom`, `stars`, `tag`
- `src/components/HotelCard.jsx`: Hiển thị ảnh thumbnail 160px cho mỗi card
- `src/pages/hotel-detail/index.jsx`: Hiển thị ảnh hero 240px + dải gallery cuộn ngang

---

### Giai đoạn 4 – Footer, Liên hệ nhanh, Bài viết chi tiết

**Thay đổi:**
- Tạo `src/components/Footer.jsx`: Footer với địa chỉ 7 chi nhánh + nút liên hệ
- Tạo `src/components/FloatingContact.jsx`: Nút liên hệ nổi cố định góc phải màn hình với 3 hành động:
  - 📞 Gọi điện → `tel:02563822222`
  - Z Chat Zalo → `https://zalo.me/02563822222`
  - ✉ Messenger → `https://m.me/mira.hotel.quynhon`
- `src/services/api.js`: Sửa `getExplorePosts()` dùng `_embed: 1` để lấy đúng ảnh đại diện từ WP REST API
- Tạo `src/pages/post-detail/index.jsx`: Xem bài viết ngay trong Mini App (thay vì mở browser)
- `src/pages/explore/index.jsx`: Điều hướng sang `/post/:id` thay vì `window.open()`
- Thêm hàm `decodeEntities()` trong `api.js` để fix lỗi hiển thị `[&hellip;]` và các HTML entity khác

---

### Giai đoạn 5 – Tính năng xem phòng theo chi nhánh

**Thay đổi:**
- `src/services/api.js`: Thêm mảng `rooms[]` cho cả 7 khách sạn, mỗi phòng có: `id`, `name`, `type`, `beds`, `size`, `guests`, `price`, `images[]`, `amenities[]`, `excerpt`
- `src/pages/hotel-detail/index.jsx`: Bổ sung section "Các loại phòng" với card phòng cuộn ngang
- Tạo `src/pages/room-detail/index.jsx`: Trang chi tiết phòng với ảnh hero, thông số, tiện nghi, nút đặt phòng
- `src/app.jsx`: Thêm route `/hotel/:hotelId/room/:roomId`

---

### Giai đoạn 6 – Sửa bug

**Bug 1:** Trang chi tiết khách sạn lỗi cú pháp do dư ký tự `}` trong JSX
- File: `src/pages/hotel-detail/index.jsx` → xoá `}` thừa trong block CTA

**Bug 2:** Trang Khám phá không có nút quay lại
- `src/pages/explore/index.jsx` → thêm nút `← Trang chủ` trong header

---

### Giai đoạn 7 – Cải tiến giao diện FloatingContact

**Thay đổi:**
- Thiết kế lại `src/components/FloatingContact.jsx`:
  - Nút FAB chính: vòng tròn gradient vàng 56px với icon SVG điện thoại
  - 3 nút con trượt lên mượt mà khi mở, kèm nhãn glassmorphism (`backdrop-filter: blur`)
  - Icon SVG tùy chỉnh cho từng loại liên hệ
  - Animation opacity + translateY
- Cập nhật Facebook URL thành `https://m.me/mira.hotel.quynhon`
- Sửa lỗi duplicate export trong quá trình chỉnh sửa

---

### Giai đoạn 8 – Tính năng chỉ đường Google Maps

**Thay đổi:**
- `src/services/api.js`: Thêm trường `mapsUrl` cho tất cả 7 khách sạn (link Google Maps `maps.google.com/?q=...`)
- `src/pages/hotel-detail/index.jsx`: Thêm nút **🗺 Chỉ đường** màu xanh Google Blue trong dải địa chỉ
- `src/components/HotelCard.jsx`: Thêm nút **Chỉ đường** (pill xanh với icon pin SVG) ngay cạnh thông tin khoảng cách — dùng `e.stopPropagation()` để tránh kích hoạt điều hướng card

**Danh sách mapsUrl từng chi nhánh:**

| Chi nhánh | Google Maps |
|---|---|
| Mira Quy Nhơn | `maps.google.com/?q=11A+Ngo+May,+Quy+Nhon` |
| Mira Boutique | `maps.google.com/?q=20+Han+Mac+Tu,+Quy+Nhon` |
| Mira Grand | `maps.google.com/?q=7+Nguyen+Thi+Dinh,+Quy+Nhon` |
| Mira Bãi Xếp | `maps.google.com/?q=Bai+Xep,+Ghenh+Rang,+Quy+Nhon` |
| Mira Aloha | `maps.google.com/?q=50+Le+Loi,+Quy+Nhon` |
| Mira Eco | `maps.google.com/?q=24+Nguyen+Nhu+Do,+Quy+Nhon` |
| Xavia Hotel | `maps.google.com/?q=24-25+Bui+Tu+Toan,+Quy+Nhon` |

---

### Tổng kết trạng thái hiện tại

| Tính năng | Trạng thái |
|---|---|
| App khởi động, simulator chạy | ✅ |
| Danh sách + chi tiết khách sạn | ✅ |
| Hình ảnh thực từ miraquynhon.com | ✅ |
| Xem phòng theo từng chi nhánh | ✅ |
| Trang chi tiết phòng | ✅ |
| Đặt phòng (form) | ✅ |
| Khám phá Quy Nhơn (bài viết WP) | ✅ |
| Xem bài viết trong app | ✅ |
| Footer địa chỉ | ✅ |
| Nút liên hệ nhanh nổi | ✅ |
| Chỉ đường Google Maps | ✅ |

---

## 📋 Nhật ký phát triển – 24/03/2026

### Bước 1 – Tích hợp `openPhone` (Gọi điện qua Zalo SDK)

- `src/components/FloatingContact.jsx`: Thay `window.open("tel:...")` bằng `openPhone({ phoneNumber: "02563822222" })` từ Zalo Mini App SDK để gọi điện đúng chuẩn native.
- Commit: `67a6b11`

---

### Bước 2 – Tích hợp `openChat` (Chat OA trong Zalo)

- `src/components/FloatingContact.jsx`: Thay link `https://zalo.me/...` bằng `openChat({ type: "oa", id: "1472945004483222469" })` để mở chat OA Mira trực tiếp trong Zalo.
- Commit: `ca2aca4`

---

### Bước 3 – SEO metadata

- `src/index.html` + `index.html` gốc: Thêm `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) cho app.
- Commit: `d59f0f7`

---

### Bước 4 – Tích hợp Zalo Pay (cọc đặt phòng)

**Phía Mini App:**
- Tạo `src/utils/payment.js`:
  - Hàm `handleDeposit(bookingInfo)` gọi WP API để tạo order → `createOrder()` → `checkTransaction()` từ Zalo Pay SDK
  - Hằng số `DEPOSIT_AMOUNT = 200_000` (200.000đ)
- `src/pages/booking/index.jsx`: Thêm nút **"Cọc 200.000đ qua Zalo Pay"** trong trang đặt phòng

**Phía WordPress Plugin (`wordpress-plugin/mira-booking-api.php`):**
- Thêm constants: `MIRA_ZALO_APP_KEY2`, `MIRA_DEPOSIT_AMOUNT`
- Endpoint mới: `POST /mira/v1/payment/order` → tính HMAC-SHA256 MAC phía server, trả về order params cho SDK
- Lưu `zalopayOrderId`, `zalopayStatus` cùng với booking
- Commit: `9ba65ab`

---

### Bước 5 – Hiệu năng (Lazy load, Skeleton, Pull-to-refresh, Code splitting)

- `src/app.jsx`: Đổi tất cả `import` trang sang `React.lazy()` + `<Suspense>`
- `src/components/LoadingSkeleton.jsx`: Tạo skeleton shimmer cho danh sách khách sạn, chi tiết khách sạn, chi tiết phòng, bài viết
- Pull-to-refresh: Xử lý bằng touch events (`onTouchStart` / `onTouchMove` / `onTouchEnd`) thay vì `onLoad` (không hỗ trợ bởi `zmp-ui`)
- `vite.config.mts`: Thêm `optimizeDeps.include` cho các thư viện nặng, `server.warmup.clientFiles`, `manualChunks` code splitting (vendor-react, vendor-zmp, vendor-router)
- Commit: `e565318`

---

### Bước 6 – Deep link, Share, Review

- `src/utils/share.js`: Tạo các hàm `handleShareHotel()`, `handleShareRoom()` dùng `openShareSheet()` + `getShareableLink()` từ Zalo SDK
- `src/pages/hotel-detail/index.jsx`: Thêm nút **Chia sẻ**
- `src/pages/room-detail/index.jsx`: Thêm nút **Chia sẻ** phòng
- `src/components/ReviewModal.jsx`: Modal đánh giá, gọi `addRating()` (đúng API SDK) 
- `src/pages/home/index.jsx`: Hiển thị nút mời đánh giá sau lần dùng thứ 3
- Commit: `530d421`

---

### Bước 7 – OA Notifications + Loyalty Points

- `src/utils/notification.js`:
  - `askOAInteract()` → gọi `interactOA({ oaId: "1472945004483222469" })`
  - `askNotificationPermission()` → gọi `requestSendNotification()`
- `src/components/LoyaltyBadge.jsx`: Hiển thị số điểm tích lũy trên hero trang chủ, click mở modal 4 hạng thành viên (Đồng / Bạc / Vàng / Kim Cương)
- `src/services/store.js`:
  - Thêm state `loyaltyPoints`, `loadPoints()` (đọc `nativeStorage`), `addPoints(n)` (ghi `nativeStorage`)
  - Mỗi lần gửi form đặt phòng thành công → +10 điểm
- Commit: `973857b`

---

### Sửa lỗi sau khi tích hợp SDK

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `share` not exported | API không tồn tại trong SDK | Dùng `openShareSheet` |
| `requestReview` not exported | API không tồn tại | Dùng `addRating` |
| `done is not a function` | `Page` (zmp-ui) không có prop `onLoad` | Dùng touch events pull-to-refresh |
| Hàm `handleShareRoom` bị duplicate | File có cả code cũ lẫn mới | Xoá block cũ |
| Favicon 404 | Không có file `.ico` | Tạo `src/favicon.ico` + thêm `<link rel="icon">` vào `index.html` |
| Warning `numberOfLines` | zmp-ui truyền prop không hợp lệ vào DOM | Dùng CSS `text-overflow: ellipsis` thay thế |
| Warning `showCount` | `Input` của zmp-ui truyền prop vào DOM | Xoá prop, tự làm counter bằng `<Text>` |
| React Router future flags warning | `ZMPRouter` không nhận prop `future` | Override `console.warn` trong DEV |
- Commits: `8c081da`, `536cdcb`, `abe0620`, `fa270a2`

---

### Thành phần `BackBar` – Nút quay lại nhất quán toàn app

**Vấn đề:** Mỗi trang có kiểu nút quay lại khác nhau (nhỏ, khó bấm, không đồng nhất).

**Giải pháp:**
- Tạo `src/components/BackBar.jsx`:
  - Thanh cao 52px, vùng chạm tối thiểu 44px (chuẩn accessibility)
  - Icon chevron-left SVG + chữ **"Quay lại"**
  - Props: `title` (tên trang), `to` (route đích, mặc định `navigate(-1)`), `bg`, `light`
- Áp dụng cho **6 trang**: `hotels`, `booking`, `explore`, `hotel-detail`, `room-detail`, `post-detail`
- Thay thế toàn bộ nút inline cũ (overlay button trong hero, `<Box>` tự tạo, ký tự `←`)
- Commit: `863c515`

---

### Tổng kết trạng thái sau ngày 24/03/2026

| Tính năng | Trạng thái |
|---|---|
| App khởi động, simulator chạy | ✅ |
| Danh sách + chi tiết khách sạn | ✅ |
| Hình ảnh thực từ miraquynhon.com | ✅ |
| Xem phòng + chi tiết phòng | ✅ |
| Đặt phòng (form) | ✅ |
| Cọc đặt phòng qua Zalo Pay | ✅ |
| Khám phá Quy Nhơn (bài viết WP) | ✅ |
| Xem bài viết trong app | ✅ |
| Footer địa chỉ 7 chi nhánh | ✅ |
| Nút liên hệ nhanh nổi (gọi / chat OA / Facebook) | ✅ |
| Chỉ đường Google Maps | ✅ |
| Gọi điện native qua Zalo SDK | ✅ |
| Chat OA Mira trong Zalo | ✅ |
| SEO metadata / Open Graph | ✅ |
| Lazy load + Skeleton + Pull-to-refresh | ✅ |
| Code splitting (vendor chunks) | ✅ |
| Chia sẻ khách sạn / phòng qua Zalo | ✅ |
| Đánh giá app (addRating) | ✅ |
| OA Notifications (requestSendNotification) | ✅ |
| Tích điểm loyalty (nativeStorage) | ✅ |
| Nút quay lại chuẩn (BackBar) toàn app | ✅ |
