/**
 * Tiện ích chia sẻ nội dung qua Zalo Mini App SDK.
 * Dùng API share để chia sẻ phòng/khách sạn đến bạn bè & group Zalo.
 */
import { share } from "zmp-sdk/apis";

// App ID của Mini App — lấy từ .env
const APP_ID = import.meta.env.VITE_APP_ID || "";

/**
 * Chia sẻ thông tin phòng khách sạn đến bạn bè / group Zalo.
 * Deep link: khi nhận bấm vào → mở Mini App đúng trang phòng đó.
 * @param {object} hotel - Đối tượng khách sạn
 * @param {object} room  - Đối tượng phòng
 */
export async function handleShareRoom(hotel, room) {
  const title = `${room.name} – ${hotel.name}`;
  const description = `🌊 ${hotel.dist} · Từ ${room.priceFrom?.toLocaleString("vi-VN")}₫/đêm · Đặt ngay tại Mira Hotels Quy Nhơn!`;

  try {
    await share({
      toUid: "0", // 0 = mở picker chọn bạn bè / group
      data: {
        type: "app-link",
        title,
        description,
        thumbnail: room.thumbnail || hotel.thumbnail || "",
        appId: APP_ID,
        path: `/hotel/${hotel.id}/room/${room.id}`,
      },
    });
  } catch {
    // Fallback: copy mô tả vào clipboard
    try {
      await navigator.clipboard.writeText(`${title}\n${description}`);
      alert("Đã copy thông tin phòng. Bạn có thể dán vào tin nhắn Zalo!");
    } catch {
      alert(`Phòng: ${title}\n${description}`);
    }
  }
}

/**
 * Chia sẻ thông tin khách sạn đến bạn bè / group Zalo.
 * @param {object} hotel - Đối tượng khách sạn
 */
export async function handleShareHotel(hotel) {
  const title = `${hotel.name} – Mira Hotels Quy Nhơn`;
  const description = `🌊 ${hotel.dist} · Từ ${hotel.priceFrom?.toLocaleString("vi-VN")}₫/đêm · Đặt phòng giá tốt nhất ngay trên Zalo!`;

  try {
    await share({
      toUid: "0",
      data: {
        type: "app-link",
        title,
        description,
        thumbnail: hotel.thumbnail || "",
        appId: APP_ID,
        path: `/hotel/${hotel.id}`,
      },
    });
  } catch {
    try {
      await navigator.clipboard.writeText(`${title}\n${description}`);
      alert("Đã copy thông tin khách sạn. Bạn có thể dán vào tin nhắn Zalo!");
    } catch {
      alert(`Khách sạn: ${title}`);
    }
  }
}
