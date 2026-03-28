/**
 * Zalo Phone Capture + OA Connect
 *
 * Luồng:
 *  1. getUserInfo()      — lấy { id, name, avatar }
 *  2. getPhoneNumber()   — hiển thị popup xin quyền SDT (native Zalo)
 *  3. interactOA()       — yêu cầu user follow OA Mira
 *  4. POST /mira/v1/user-connect — lưu user vào WP DB
 *
 * Tất cả lỗi đều được bắt nội bộ để không crash booking flow.
 */
import { getUserInfo, getPhoneNumber, interactOA } from "zmp-sdk/apis";
import { MIRA_OA_ID } from "./contact";

const WP_API = "https://miraquynhon.com/wp-json/mira/v1";

/**
 * Thực hiện toàn bộ luồng kết nối: lấy SDT → follow OA → lưu WP.
 * @returns {{ success: boolean, userInfo: object }}
 */
export async function connectUserToOA() {
  // 1. Lấy thông tin cơ bản
  let userInfo = {};
  try {
    const res = await getUserInfo({});
    userInfo = {
      id:     res.userInfo?.id     || "",
      name:   res.userInfo?.name   || "",
      avatar: res.userInfo?.avatar || "",
    };
  } catch {
    // Không bắt được userInfo — tiếp tục với object rỗng
  }

  // 2. Xin quyền số điện thoại (có thể bị từ chối — không block)
  let phoneToken = "";
  try {
    const phoneRes = await getPhoneNumber({});
    phoneToken = phoneRes?.token || "";
  } catch {
    // Người dùng từ chối quyền SDT — bỏ qua, không block
  }

  // 3. Yêu cầu follow OA (non-blocking)
  if (MIRA_OA_ID) {
    try {
      await interactOA({ oaId: MIRA_OA_ID });
    } catch {
      // Đã follow hoặc từ chối — bỏ qua
    }
  }

  // 4. Gửi lên WP để lưu user (non-blocking nếu thất bại)
  if (userInfo.id) {
    try {
      const resp = await fetch(`${WP_API}/user-connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zaloUserId:  userInfo.id,
          displayName: userInfo.name,
          avatar:      userInfo.avatar,
          phoneToken,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch (err) {
      // Lưu lại pending để retry lần mở app tiếp theo
      try {
        const { nativeStorage } = await import("zmp-sdk/apis");
        nativeStorage.setItem("mira_connect_pending", JSON.stringify({
          zaloUserId:  userInfo.id,
          displayName: userInfo.name,
          avatar:      userInfo.avatar,
          phoneToken,
          timestamp:   Date.now(),
        }));
      } catch {
        // bỏ qua nếu storage lỗi
      }
    }
  }

  return { success: true, userInfo };
}

/**
 * Kiểm tra xem user đã kết nối OA chưa (bằng cách hỏi WP).
 * @param {string} zaloUserId
 * @returns {Promise<boolean>}
 */
export async function checkUserConnected(zaloUserId) {
  if (!zaloUserId) return false;
  try {
    const resp = await fetch(`${WP_API}/user-connect/${encodeURIComponent(zaloUserId)}`);
    if (!resp.ok) return false;
    const data = await resp.json();
    return Boolean(data?.connected);
  } catch {
    return false;
  }
}

/**
 * Gửi lại pending connect nếu lần trước thất bại.
 * Gọi khi app mở lại, sau initUser().
 */
export async function retryPendingConnect() {
  try {
    const { nativeStorage } = await import("zmp-sdk/apis");
    const raw = nativeStorage.getItem("mira_connect_pending");
    if (!raw) return;
    const pending = JSON.parse(raw);
    // Không retry nếu quá 7 ngày
    if (Date.now() - pending.timestamp > 7 * 24 * 60 * 60 * 1000) {
      nativeStorage.removeItem("mira_connect_pending");
      return;
    }
    const resp = await fetch(`${WP_API}/user-connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending),
    });
    if (resp.ok) {
      nativeStorage.removeItem("mira_connect_pending");
    }
  } catch {
    // bỏ qua
  }
}
