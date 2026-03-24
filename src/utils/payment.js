/**
 * Tiện ích thanh toán Zalo Pay qua ZMP Checkout SDK.
 *
 * Flow:
 *   1. gọi wpApi.createPaymentOrder() → nhận signed order (MAC từ server)
 *   2. gọi createOrder() → mở giao diện Zalo Pay
 *   3. gọi checkTransaction() → xác minh giao dịch
 *
 * Yêu cầu server:
 *   - WordPress plugin đã cài và cấu hình MIRA_ZALO_APP_KEY2
 */
import { createOrder, checkTransaction } from "zmp-sdk/apis";
import { wpApi } from "../services/api";

export const DEPOSIT_AMOUNT = 200_000; // VND – có thể chỉnh

/**
 * Thực hiện thanh toán đặt cọc qua Zalo Pay.
 * @param {{ hotelName: string, checkIn: string, name: string, phone: string }} bookingInfo
 * @returns {{ orderId: string, status: string }} – orderId dùng để gắn vào booking
 * @throws nếu server chưa cấu hình key2 hoặc người dùng huỷ thanh toán
 */
export async function handleDeposit(bookingInfo) {
  // 1. Lấy signed order data từ server (MAC tính server-side, an toàn)
  const orderData = await wpApi.createPaymentOrder({
    hotelName: bookingInfo.hotelName,
    checkIn: bookingInfo.checkIn,
    name: bookingInfo.name,
    phone: bookingInfo.phone,
  });

  if (!orderData.success) {
    throw new Error(orderData.message || "Không thể tạo đơn thanh toán.");
  }

  // 2. Mở giao diện Zalo Pay
  const { orderId } = await createOrder({
    amount: orderData.amount,
    item: orderData.item,
    desc: orderData.desc,
    mac: orderData.mac,
    extradata: orderData.extradata,
  });

  // 3. Xác minh trạng thái giao dịch
  const verification = await checkTransaction({ data: { orderId } });

  return {
    orderId,
    status: verification?.returnCode === 1 ? "success" : "pending",
  };
}
