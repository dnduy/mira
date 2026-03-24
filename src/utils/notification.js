/**
 * Tiện ích xin quyền thông báo qua Zalo OA & Zalo System.
 *
 * - interactOA: yêu cầu user cho phép OA gửi tư vấn / xác nhận đặt phòng
 * - requestSendNotification: yêu cầu quyền gửi thông báo hệ thống Zalo
 */
import { interactOA, requestSendNotification } from "zmp-sdk/apis";
import { MIRA_OA_ID } from "./contact";

/**
 * Yêu cầu người dùng cho phép OA tương tác (nhận thông báo xác nhận đặt phòng).
 * Thường gọi sau khi đặt phòng thành công.
 */
export async function askOAInteract() {
  if (!MIRA_OA_ID) return;
  try {
    await interactOA({ oaId: MIRA_OA_ID });
  } catch {
    // Người dùng từ chối hoặc đã follow — bỏ qua
  }
}

/**
 * Yêu cầu quyền gửi Zalo system notification.
 * Nên gọi lần đầu sau khi user tương tác (không nên gọi ngay lúc mở app).
 */
export async function askNotificationPermission() {
  try {
    await requestSendNotification();
  } catch {
    // Người dùng từ chối — bỏ qua
  }
}
