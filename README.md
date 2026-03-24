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
