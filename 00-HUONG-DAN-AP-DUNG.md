# 📋 HƯỚNG DẪN ÁP DỤNG — Mira Quy Nhơn Zalo Mini App

Cập nhật: thêm Mira Sun, đưa điều khiển xuống đáy, bottom navigation.

---

## ✅ 1. THÊM KHÁCH SẠN MIRA SUN

**File:** `src/services/api.js`

Mở mảng `HOTELS_STATIC`, chèn object trong file `01-mira-sun-data.js` vào
**trước** object Xavia (id: 7), hoặc cuối mảng. Giữ `id: 8` duy nhất.

Đồng thời cập nhật `HOTEL_OPTIONS` trong `src/pages/booking/index.jsx`:

```js
const HOTEL_OPTIONS = [
  { value: "mira-quy-nhon",  label: "Mira Hotel Quy Nhơn (100m biển)" },
  { value: "mira-boutique",  label: "Mira Boutique Hotel" },
  { value: "mira-grand",     label: "Mira Grand" },
  { value: "mira-sun",       label: "Mira Sun (cạnh Hồ Sinh Thái)" },  // ← THÊM
  { value: "mira-bai-xep",   label: "Mira Bãi Xếp (Homestay)" },
  { value: "mira-aloha",     label: "Mira Aloha" },
  { value: "mira-eco",       label: "Mira Eco (50m biển)" },
  { value: "xavia-hotel",    label: "Xavia Hotel" },
];
```

Và `HOTELS` trong `src/components/Footer.jsx`:

```js
const HOTELS = [
  { name: "Mira Quy Nhơn Hotel",  addr: "11A Ngô Mây, TP Quy Nhơn" },
  { name: "Mira Boutique Hotel",  addr: "20 Hàn Mặc Tử, TP Quy Nhơn" },
  { name: "Mira Grand Hotel",     addr: "7 Nguyễn Thị Định, TP Quy Nhơn" },
  { name: "Mira Sun Hotel",       addr: "Khu Hồ Sinh Thái, TP Quy Nhơn" },  // ← THÊM
  { name: "Mira Bãi Xếp",         addr: "Bãi Xếp, Ghềnh Ráng, Quy Nhơn" },
  { name: "Mira Aloha Hotel",     addr: "50 Lê Lợi, TP Quy Nhơn" },
  { name: "Mira Eco Hotel",       addr: "24 Nguyễn Như Đỗ, TP Quy Nhơn" },
  { name: "Xavia Hotel",          addr: "24–25 Bùi Tư Toàn, TP Quy Nhơn" },
];
```

> ⚠️ Số chi nhánh nay là **8**. Sửa các chỗ ghi "7 khách sạn" → "8 khách sạn":
> - `src/pages/home/index.jsx`: hero-sub "7 khách sạn", stat value "7", text "Hệ thống 8 KS"
> - `src/pages/hotels/index.jsx`: BackBar title "7 Khách sạn Mira", header "7 Khách sạn Mira"
> - `app.config.js` / SEO description nếu có nhắc số lượng

---

## ✅ 2. BOTTOM NAVIGATION (điều hướng dưới màn hình)

**File mới:** `src/components/BottomNav.jsx` (đã tạo)
**File sửa:** `src/app.jsx` (đã tạo bản mới — copy đè)

Vì BottomNav cố định đáy (height 64px + safe-area), các **trang gốc** phải chừa
khoảng trống dưới để không bị che. Thêm padding-bottom vào `<Page>`:

### `src/pages/home/index.jsx`
Footer là phần tử cuối — thêm padding sau Footer hoặc vào Page:
```jsx
<Page className="home-page" style={{ paddingBottom: 64 }} ...>
```

### `src/pages/hotels/index.jsx` và `src/pages/explore/index.jsx`
```jsx
<Page style={{ paddingBottom: 80 }} ...>
```
(booking có nút submit riêng, thêm `paddingBottom: 80` vào Box cuối)

> Đã tắt tabBar mặc định Zalo: trong `app.config.js` đổi `tabBar.custom: true`
> HOẶC xoá block `tabBar` (vì ta dùng BottomNav custom). Nếu giữ tabBar gốc sẽ
> bị **2 thanh chồng nhau**. Khuyến nghị: xoá block `tabBar` trong app.config.js.

---

## ✅ 3. ĐƯA NÚT QUAY LẠI XUỐNG ĐÁY (BottomBar)

**File mới:** `src/components/BottomBar.jsx` (đã tạo)

Thay `BackBar` (trên đầu) bằng `BottomBar` (dưới đáy) ở các trang con:
`hotel-detail`, `room-detail`, `post-detail`.

### Cách thay (ví dụ `hotel-detail/index.jsx`):

1. Xoá `import BackBar` → `import BottomBar from "../../components/BottomBar";`
2. Xoá `<BackBar />` ở đầu Page.
3. Thêm padding-bottom cho Box nội dung cuối: `paddingBottom: 90`
4. Thêm cuối Page (trước `</Page>`):

```jsx
<BottomBar
  to="/hotels"
  actionLabel="Đặt phòng ngay"
  onAction={handleBooking}
  action={
    <button onClick={() => handleShareHotel(currentHotel)}
      style={{ width: 48, height: 48, borderRadius: 14, background: "#EFF6FF",
        border: "1px solid #BFDBFE", flexShrink: 0, cursor: "pointer" }}>
      {/* icon share SVG */}
    </button>
  }
/>
```

> Lợi ích: nút quay lại + đặt phòng nằm trong tầm ngón cái (thumb zone),
> chuẩn UX mobile 2025. Nút cũ "Đặt phòng ngay" giữa nội dung có thể bỏ.

---

## ✅ 4. SỬA LỖI ĐANG TỒN TẠI (phát hiện khi review)

### 🔴 LỖI NẶNG — `wordpress-plugin/mira-booking-api.php` dòng ~118
```php
public function handle_booking( WP_REST_Request $request ) {( WP_REST_Request $request ) {
```
→ Lặp `( WP_REST_Request $request ) {` hai lần → **PHP fatal error**, plugin không chạy.
Sửa thành:
```php
public function handle_booking( WP_REST_Request $request ) {
    $data = $request->get_params();
```

### 🔴 LỖI — `src/pages/hotels/index.jsx` dòng ~48
```jsx
{/* Header */}}   ← dư một dấu }
```
→ Sửa thành `{/* Header */}`

### 🟡 Trùng route user-connect
Trong plugin, route `/user-connect` được `register_rest_route` **2 lần**
(1 lần trong class `Mira_Booking_API::register_routes` trỏ tới method không tồn tại,
1 lần ở `add_action('rest_api_init')` cuối file trỏ `Mira_User_Connect`).
→ Xoá block đăng ký `/user-connect` trong `Mira_Booking_API::register_routes()`
(giữ lại bản ở cuối file trỏ đúng class `Mira_User_Connect`).

### 🟡 Hàm chết — `src/services/api.js`
`createPaymentOrder` vẫn còn dù Zalo Pay đã huỷ (ghi trong README giai đoạn 4).
→ Xoá để gọn code.

### 🟡 Lệch điểm loyalty
`ConnectOAModal.jsx` ghi "+100 điểm" (đúng theo code `addPoints(100)`),
nhưng `LoyaltyBadge.jsx` ghi "+100 điểm" còn README cũ ghi "+10". Đồng bộ = 100. ✓

---

## ✅ 5. ĐỀ XUẤT NÂNG CAO (chi tiết ở file 02-de-xuat-nang-cao.md)
