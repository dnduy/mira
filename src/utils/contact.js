/**
 * Tiện ích xử lý liên hệ trong Zalo Mini App.
 * Dùng ZMP SDK thay vì tel: link / zalo.me link để đảm bảo hoạt động đúng trong Zalo.
 */
import { openPhone, openChat } from "zmp-sdk/apis";

// OA ID của Mira — cấu hình trong file .env: VITE_ZALO_OA_ID=<oa_id>
export const MIRA_OA_ID = import.meta.env.VITE_ZALO_OA_ID || "";

/**
 * Gọi điện thoại qua Zalo Mini App SDK.
 * Fallback: copy số vào clipboard + thông báo nếu openPhone thất bại.
 * @param {string} phoneNumber - Số điện thoại cần gọi (VD: "02563822222")
 */
export async function handleCall(phoneNumber) {
  try {
    await openPhone({ phoneNumber });
  } catch (err) {
    // Fallback: copy số điện thoại vào clipboard
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert(`Không thể gọi trực tiếp.\nĐã copy số ${phoneNumber} vào clipboard.`);
    } catch {
      alert(`Vui lòng gọi số: ${phoneNumber}`);
    }
  }
}

/**
 * Mở cửa sổ chat với Zalo OA của Mira.
 * Fallback: mở trang zalo.me nếu SDK thất bại hoặc chưa cấu hình OA ID.
 * @param {string} [oaId] - OA ID, mặc định lấy từ MIRA_OA_ID (env)
 */
export async function handleOpenChat(oaId = MIRA_OA_ID) {
  if (!oaId) {
    // Chưa cấu hình OA ID — fallback về zalo.me phone
    window.open("https://zalo.me/02563822222");
    return;
  }
  try {
    await openChat({ type: "oa", id: oaId });
  } catch (err) {
    // Fallback: mở zalo.me profile OA
    window.open(`https://zalo.me/${oaId}`);
  }
}
