/**
 * Tiện ích chia sẻ nội dung qua Zalo Mini App SDK.
 * Dùng openShareSheet để chia sẻ link đến bạn bè & group Zalo.
 */
import { openShareSheet, getShareableLink } from "zmp-sdk/apis";

/**
 * Lấy shareable link có kèm deep-link path (nếu SDK hỗ trợ).
 * Fallback về URL tĩnh của website nếu SDK thất bại.
 */
async function buildShareLink(path) {
  try {
    const { link } = await getShareableLink({ path });
    return link;
  } catch {
    return `https://miraquynhon.com${path}`;
  }
}

/**
 * Chia sẻ thông tin phòng khách sạn đến bạn bè / group Zalo.
 * @param {object} hotel - Đối tượng khách sạn
 * @param {object} room  - Đối tượng phòng
 */
export async function handleShareRoom(hotel, room) {
  const title = `${room.name} – ${hotel.name}`;
  const description = `🌊 ${hotel.dist || "Gần biển"} · Từ ${room.priceFrom?.toLocaleString("vi-VN")}₫/đêm · Đặt ngay tại Mira Hotels Quy Nhơn!`;
  const link = await buildShareLink(`/hotel/${hotel.id}/room/${room.id}`);

  try {
    await openShareSheet({
      type: "link",
      data: {
        link,
        title,
        thumb: room.thumbnail || hotel.thumbnail || "",
        description,
      },
    });
  } catch {
    // Fallback: copy mô tả vào clipboard
    try {
      await navigator.clipboard.writeText(`${title}\n${description}\n${link}`);
      alert("Đã copy thông tin phòng. Bạn có thể dán vào tin nhắn Zalo!");
    } catch {
      alert(`Phòng: ${title}`);
    }
  }
}

/**
 * Chia sẻ thông tin khách sạn đến bạn bè / group Zalo.
 * @param {object} hotel - Đối tượng khách sạn
 */
export async function handleShareHotel(hotel) {
  const title = `${hotel.name} – Mira Hotels Quy Nhơn`;
  const description = `🌊 ${hotel.dist || "Gần biển"} · Từ ${hotel.priceFrom?.toLocaleString("vi-VN")}₫/đêm · Đặt phòng giá tốt nhất ngay trên Zalo!`;
  const link = await buildShareLink(`/hotel/${hotel.id}`);

  try {
    await openShareSheet({
      type: "link",
      data: {
        link,
        title,
        thumb: hotel.thumbnail || "",
        description,
      },
    });
  } catch {
    try {
      await navigator.clipboard.writeText(`${title}\n${description}\n${link}`);
      alert("Đã copy thông tin khách sạn. Bạn có thể dán vào tin nhắn Zalo!");
    } catch {
      alert(`Khách sạn: ${title}`);
    }
  }
}
