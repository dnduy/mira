# 🛠️ COPILOT TASKS — Mira Quy Nhơn Zalo Mini App (Review 31/05/2026)

> File này mô tả CHI TIẾT các việc cần làm cho GitHub Copilot.
> Mỗi task gồm: **File · Vấn đề · Cách sửa (code cụ thể) · Tiêu chí done.**
> Stack: React 18 + zmp-ui 1.11.13 + zmp-sdk 2.51.1 + zustand 4 + Vite 5.
> Project root: `/Users/duyduong/Documents/code/zalo mini app/miraquynhon/mira`
>
> Ưu tiên: 🔴 = bug thật, phải làm ngay · 🟡 = nên làm · 🟢 = nâng cao (optional).

---

## 🔴 TASK 1 — Thêm paddingBottom cho trang gốc (BottomNav đang che nội dung)

**File:** `src/pages/home/index.jsx`, `src/pages/explore/index.jsx`

**Vấn đề:** `BottomNav` cố định `position: fixed; height: 64px` + safe-area. Hai trang gốc
này KHÔNG chừa khoảng trống dưới → Footer (home) và nút "Xem thêm trên website" (explore)
bị thanh nav che khuất, không bấm được. (`hotels` đã có `paddingBottom: 80`, `booking` cũng
cần kiểm tra.)

**Cách sửa:**

### `src/pages/home/index.jsx`
Footer là phần tử cuối trong `<Page className="home-page" ...>`. Thêm padding cho Page:
```jsx
<Page
  className="home-page"
  style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))" }}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
```

### `src/pages/explore/index.jsx`
Bọc nội dung cuối hoặc thêm style cho Page:
```jsx
<Page style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}>
```

### `src/pages/booking/index.jsx`
Trang booking có nút submit ở cuối, cũng nằm trong vùng BottomNav. Thêm padding cho Box
nội dung cuối (Box có `padding: 16`):
```jsx
<Box style={{ padding: "16px 16px calc(80px + env(safe-area-inset-bottom, 0px))",
              display: "flex", flexDirection: "column", gap: 14 }}>
```

**Done khi:** Cuộn xuống cuối home/explore/booking, toàn bộ nội dung (Footer, nút Xem thêm,
nút Gửi yêu cầu) hiển thị đầy đủ phía trên BottomNav, không bị che, bấm được.

---

## 🔴 TASK 2 — Fix deep link phòng khi `hotels` chưa load (room-detail trắng trang)

**File:** `src/pages/room-detail/index.jsx`

**Vấn đề:** Component tìm phòng bằng `hotels.find(...)` lấy từ store. Khi user mở app
trực tiếp qua deep link `?hotelId=8&roomId=msun-suite` (DeepLinkHandler điều hướng tới
`/hotel/8/room/msun-suite`), mảng `hotels` trong store có thể **vẫn rỗng** vì chưa trang nào
gọi `fetchHotels()`. Kết quả: luôn rơi vào nhánh "Không tìm thấy thông tin phòng" dù phòng có thật.

**Cách sửa:** Gọi `fetchHotels()` nếu `hotels` rỗng, và hiển thị loading thay vì "not found"
trong lúc đang tải.

```jsx
import React, { useEffect } from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import { handleShareRoom } from "../../utils/share";
import BottomBar from "../../components/BottomBar";

const RoomDetailPage = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { hotels, hotelsLoading, fetchHotels, setBookingField } = useAppStore();

  // Nếu vào thẳng qua deep link mà store chưa có data → tải
  useEffect(() => {
    if (hotels.length === 0) fetchHotels();
  }, []);

  const hotel = hotels.find((h) => String(h.id) === String(hotelId));
  const room = hotel?.rooms?.find((r) => r.id === roomId);

  // Đang tải data → hiện loading thay vì "not found"
  if (hotelsLoading || hotels.length === 0) {
    return (
      <Page>
        <Box style={{ padding: 32, textAlign: "center" }}>
          <Text style={{ color: "#7F8C8D", fontSize: 14 }}>Đang tải thông tin phòng...</Text>
        </Box>
        <BottomBar to={`/hotel/${hotelId}`} />
      </Page>
    );
  }

  if (!hotel || !room) {
    // ... giữ nguyên nhánh not-found cũ ...
  }
  // ... phần còn lại giữ nguyên ...
};
```

**Done khi:** Mở app bằng deep link phòng (test: thêm `?hotelId=8&roomId=msun-suite` vào URL
dev) → hiển thị đúng phòng Suite của Mira Sun, không ra "Không tìm thấy".

---

## 🔴 TASK 3 — Sửa regex validate số điện thoại

**File:** `src/pages/booking/index.jsx` (hàm `validate`) VÀ `wordpress-plugin/mira-booking-api.php`

**Vấn đề:** Regex hiện tại `/^(0|\+84)\d{9}$/` chấp nhận cả `0` + 9 số (10 ký tự, ĐÚNG) lẫn
`+84` + 9 số (= `+84xxxxxxxxx`, nhưng số VN sau +84 phải 9 chữ số sau số 0 đầu → tổng đúng).
Vấn đề thực: nhánh `0\d{9}` đúng, nhưng pattern gộp khiến `+84` chỉ match 9 số là thiếu/thừa
không nhất quán. Chuẩn hoá rõ ràng 2 nhánh riêng.

**Cách sửa (JS — `src/pages/booking/index.jsx`):**
```js
const PHONE_RE = /^(0\d{9}|\+84\d{9})$/;
// ...
if (!bookingForm.phone.trim() || !PHONE_RE.test(bookingForm.phone.trim())) {
  openSnackbar({ text: "Số điện thoại không hợp lệ (VD: 0901234567)", type: "error" });
  return false;
}
```

**Cách sửa (PHP — `wordpress-plugin/mira-booking-api.php`, trong `handle_booking`):**
```php
if ( ! preg_match('/^(0\d{9}|\+84\d{9})$/', $data['phone']) ) {
```

**Done khi:** `0901234567` hợp lệ, `+84901234567` hợp lệ, `090123` và `abc` bị chặn ở cả
client lẫn server.

---

## 🟡 TASK 4 — Xoá code chết: `createPaymentOrder` + import không dùng

**File:** `src/services/api.js`, `src/pages/booking/index.jsx`

**Vấn đề:**
1. `api.js` còn hàm `createPaymentOrder` gọi `/payment/order` — endpoint này đã bị gỡ khỏi
   plugin (Zalo Pay huỷ giai đoạn 4). Hàm chết, gây hiểu nhầm.
2. `booking/index.jsx` import `askOAInteract`, `askNotificationPermission` từ
   `../../utils/notification` nhưng KHÔNG hề gọi trong file. Dead import.

**Cách sửa:**
- Trong `api.js`: xoá toàn bộ block `createPaymentOrder: async (data) => { ... },` (kèm comment
  JSDoc phía trên nó).
- Trong `booking/index.jsx`: xoá dòng
  `import { askOAInteract, askNotificationPermission } from "../../utils/notification";`
  (file `utils/notification.js` vẫn giữ lại để dùng sau).

**Done khi:** `npm run build` không lỗi, không còn tham chiếu `createPaymentOrder` /
`askOAInteract` / `askNotificationPermission` trong toàn repo (`grep -r` ra rỗng ngoài
chính file notification.js).

---

## 🟡 TASK 5 — Sửa slug sai chính tả phòng Deluxe Family (Mira Sun)

**File:** `src/services/api.js` (object room `msun-deluxe-family-sea-lake`)

**Vấn đề:** Field `slug` đã đúng là `"deluxe-family-sea-lake"`, nhưng `link` vẫn trỏ
`https://miraquynhon.com/phong/deuxe-family-sea-lake/` (thiếu chữ "l" — "deuxe").
Đây là lỗi chính tả từ web gốc. Cần xác minh URL thật trên website rồi đồng bộ.

**Cách sửa:**
1. Kiểm tra URL thật: mở `https://miraquynhon.com/phong/deluxe-family-sea-lake/` và
   `https://miraquynhon.com/phong/deuxe-family-sea-lake/` — cái nào trả 200 thì giữ cái đó.
2. Đồng bộ `slug` và `link` cho khớp URL thật. Nếu web gốc dùng "deuxe" (sai chính tả) thì
   `link` để "deuxe" cho đúng thực tế; `slug` nội bộ nên để `"deluxe-family-sea-lake"`.

**Done khi:** `link` của phòng này mở được (200), không 404.

---

## 🟡 TASK 6 — Đồng bộ "5 sao" → "3 sao" trong metadata (lệch SEO/marketing)

**File:** `app.config.js`, `app-config.json`, `index.html`, `src/index.html`

**Vấn đề:** `app.config.js` và `app-config.json` mô tả "Khách sạn 5 sao biển" + nhắc
"Zalo Pay" (đã gỡ). Data thật toàn bộ là 2–3 sao, và Zalo Pay không còn. Sai lệch gây mất
uy tín + hiểu nhầm khi share.

**Cách sửa:** Cập nhật `title` + `description` cho thống nhất, bỏ "5 sao" và "Zalo Pay":

```js
// app.config.js
app: {
  title: "Mira Quy Nhơn — Hệ thống khách sạn biển, đặt phòng nhanh",
  description:
    "Đặt phòng 8 khách sạn Mira Quy Nhơn ngay trên Zalo: gần biển & view Hồ Sinh Thái. " +
    "Giá tốt, xác nhận nhanh, không thu phí đặt cọc, hỗ trợ chỉ đường & chat OA.",
  icon: "https://miraquynhon.com/wp-content/uploads/2024/10/logo.png",
},
```
Đồng bộ y hệt sang `app-config.json` (field `app.title`, `app.description`).
Trong `index.html` + `src/index.html`: cập nhật `<title>` và `<meta name="description">`
cho khớp (bỏ "5 sao").

**Done khi:** Không còn chuỗi "5 sao" hay "Zalo Pay" trong 4 file trên.

---

## 🟡 TASK 7 — Thống nhất số hotline (đang có 3 số khác nhau)

**File:** `src/pages/booking/index.jsx`, `src/components/Footer.jsx`,
`src/components/FloatingContact.jsx`, `wordpress-plugin/mira-booking-api.php`

**Vấn đề:** Số điện thoại liên hệ không nhất quán:
- `FloatingContact.jsx` + `Footer.jsx`: `02563822222`
- `booking/index.jsx`: nút "Gọi trực tiếp" dùng `02563821234`, snackbar lỗi ghi "0256 XXX XXXX"
- Plugin PHP: email/Zalo ghi "0256 XXX XXXX" (placeholder)

**Cách sửa:** Chọn 1 số chuẩn (xác nhận với chủ — giả định `02563822222`), tạo hằng số dùng chung.
- Sửa `booking/index.jsx`: nút gọi trực tiếp dùng cùng `02563822222`; snackbar lỗi ghi số thật.
- Plugin PHP: thay mọi "0256 XXX XXXX" bằng số thật.
- (Tốt nhất) đưa số vào `.env` `VITE_HOTLINE=02563822222` và import, nhưng tối thiểu là
  hard-code thống nhất 1 số.

**Done khi:** `grep -rn "0256" src/ wordpress-plugin/` chỉ ra DUY NHẤT một số điện thoại.

---

## 🟡 TASK 8 — Cảnh báo: `Select`/`Picker` import thừa + `dayjs` ngày mặc định

**File:** `src/pages/booking/index.jsx`

**Vấn đề:**
1. Import `Picker` từ zmp-ui nhưng không dùng → cảnh báo lint, tăng bundle.
2. `checkIn`/`checkOut` mặc định dùng `today`/`tomorrow` chỉ ở `value` của Input nhưng KHÔNG
   set vào store. Nếu user không chạm vào ô ngày rồi bấm gửi → `bookingForm.checkIn` rỗng →
   validate báo lỗi dù ô đang hiển thị ngày. UX khó hiểu.

**Cách sửa:**
1. Xoá `Picker` khỏi dòng import.
2. Khởi tạo ngày mặc định vào store khi mount:
```jsx
useEffect(() => {
  if (!bookingForm.checkIn)  setBookingField("checkIn", today);
  if (!bookingForm.checkOut) setBookingField("checkOut", tomorrow);
}, []);
```

**Done khi:** Mở trang booking, không chạm ngày, bấm "Gửi yêu cầu" → không báo lỗi ngày
(vì store đã có sẵn today/tomorrow).

---

## 🟢 TASK 9 — Tách `HOTELS_STATIC` ra file riêng

**File mới:** `src/data/hotels.js` · **Sửa:** `src/services/api.js`

**Vấn đề:** `HOTELS_STATIC` ~1000 dòng nằm chung trong `api.js` khó bảo trì khi đã có 8 chi nhánh.

**Cách sửa:**
- Tạo `src/data/hotels.js`:
```js
export const HOTELS_STATIC = [ /* ... toàn bộ mảng hiện tại ... */ ];
```
- Trong `api.js`: `import { HOTELS_STATIC } from "../data/hotels";` và xoá mảng inline.
- Giữ nguyên các hàm `getHotels`/`getHotelDetail`.

**Done khi:** App chạy y như cũ, `api.js` ngắn lại còn phần logic API.

---

## 🟢 TASK 10 — Cache offline hotels bằng nativeStorage

**File:** `src/services/store.js`

**Vấn đề:** Mỗi lần mở app `fetchHotels()` chạy lại. Dữ liệu tĩnh nên cache để mở tức thì.

**Cách sửa (gợi ý):** Trong `fetchHotels`, đọc cache trước, set ngay, rồi mới refresh nền:
```js
fetchHotels: async () => {
  // 1. Hiện cache ngay nếu có
  try {
    const cached = nativeStorage.getItem("mira_hotels_cache");
    if (cached) set({ hotels: JSON.parse(cached), hotelsLoading: false });
    else set({ hotelsLoading: true });
  } catch { set({ hotelsLoading: true }); }
  // 2. Refresh
  try {
    const data = await wpApi.getHotels();
    set({ hotels: data, hotelsLoading: false, hotelsError: null });
    try { nativeStorage.setItem("mira_hotels_cache", JSON.stringify(data)); } catch {}
  } catch (err) {
    set({ hotelsLoading: false });
    if (!get().hotels.length) set({ hotelsError: err.message });
  }
},
```

**Done khi:** Lần mở thứ 2 danh sách hiện ngay, không nháy skeleton.

---

## 🟢 TASK 11 — Hiển thị tổng giá tạm tính trong form booking

**File:** `src/pages/booking/index.jsx`

**Vấn đề:** Khách không thấy số đêm × giá → giảm minh bạch & tỷ lệ chốt.

**Cách sửa (gợi ý):** Tính số đêm từ `checkIn`/`checkOut` bằng dayjs, nhân giá `priceFrom`
của khách sạn đã chọn (lookup từ `hotels` store theo `hotelId`/`slug`), hiển thị 1 Box tóm tắt
phía trên nút submit:
```jsx
const nights = Math.max(1, dayjs(bookingForm.checkOut).diff(dayjs(bookingForm.checkIn), "day"));
const selected = hotels.find(h => h.slug === bookingForm.hotelId || String(h.id) === String(bookingForm.hotelId));
const estimate = selected ? selected.priceFrom * nights : 0;
```
Lưu ý: `HOTEL_OPTIONS.value` đang là slug (`"mira-sun"`) còn `hotels` dùng `id` số + `slug` →
lookup theo `slug` cho khớp. Ghi rõ "Giá tạm tính từ — chưa gồm thuế phí, KS xác nhận lại".

**Done khi:** Đổi khách sạn/ngày → tổng tạm tính cập nhật realtime.

---

## 🟢 TASK 12 — Schema.org Hotel JSON-LD (SEO website nguồn)

**File:** Website `miraquynhon.com` (KHÔNG phải Mini App) — ghi chú để làm bên WordPress.

**Vấn đề:** Trang chi nhánh chưa có structured data → mất cơ hội rich result + Google Hotel.

**Cách làm:** Mỗi trang `loai-phong/<slug>/` chèn JSON-LD:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Mira Sun Hotel",
  "starRating": { "@type": "Rating", "ratingValue": "3" },
  "address": { "@type": "PostalAddress", "addressLocality": "Quy Nhơn", "addressRegion": "Bình Định", "addressCountry": "VN" },
  "priceRange": "650.000₫ - 1.500.000₫",
  "image": "https://miraquynhon.com/wp-content/uploads/2026/03/084633c86aebe4b5bdfa.jpg"
}
</script>
```
Làm tương tự cho 8 chi nhánh (đổi name/star/price/image). Có thể chèn qua plugin SEO
(Yoast/RankMath) hoặc functions.php hook `wp_head`.

**Done khi:** Test bằng Google Rich Results Test → nhận diện Hotel, không lỗi.

---

## ✅ CHECKLIST TỔNG (build & smoke test sau khi xong 🔴 + 🟡)

```bash
npm install
npm run build          # phải pass, không lỗi
npm start              # chạy simulator
```
Kiểm thủ công:
- [ ] Cuộn cuối home/explore/booking — nội dung không bị BottomNav che.
- [ ] Deep link `?hotelId=8&roomId=msun-suite` → ra đúng phòng Suite Mira Sun.
- [ ] Đặt phòng không chạm ngày vẫn gửi được; SĐT `0901234567` hợp lệ.
- [ ] `grep -rn "createPaymentOrder\|askOAInteract\|5 sao\|Zalo Pay" src/ app*.* index.html` → rỗng.
- [ ] `grep -rn "0256" src/ wordpress-plugin/` → chỉ 1 số duy nhất.
- [ ] Plugin PHP: `curl https://miraquynhon.com/wp-json/mira/v1/ping` → `{"status":"ok"}`.
