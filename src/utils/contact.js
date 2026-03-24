/**
 * Tiện ích xử lý liên hệ trong Zalo Mini App.
 * Dùng ZMP SDK thay vì tel: link để đảm bảo hoạt động đúng trong môi trường Zalo.
 */
import { openPhone } from "zmp-sdk/apis";

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
