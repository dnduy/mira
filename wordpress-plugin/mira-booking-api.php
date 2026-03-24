<?php
/**
 * Plugin Name: Mira Booking API
 * Description: Custom REST API cho Zalo Mini App – nhận đặt phòng, gửi email + Zalo OA notification
 * Version: 1.0.0
 * Author: Mira Quy Nhon
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Cấu hình – SỬA CÁC GIÁ TRỊ NÀY ────────────────────────────────────────
define( 'MIRA_ADMIN_EMAIL',   'booking@miraquynhon.com' );   // Email nhận đơn đặt phòng
define( 'MIRA_FROM_EMAIL',    'noreply@miraquynhon.com' );
define( 'MIRA_FROM_NAME',     'Mira Quy Nhon Hotel' );

// Zalo OA – lấy tại: https://developers.zalo.me/docs/official-account
// Sau khi lấy Access Token, dán vào đây (hoặc dùng wp-config.php)
define( 'MIRA_ZALO_OA_TOKEN', defined('ZALO_OA_ACCESS_TOKEN') ? ZALO_OA_ACCESS_TOKEN : 'YOUR_OA_ACCESS_TOKEN' );
define( 'MIRA_ZALO_OA_ID',    'YOUR_OA_ID' );     // OA ID lấy từ Zalo for Business
define( 'MIRA_ZALO_TEMPLATE_ID', 'YOUR_TEMPLATE_ID' ); // Template ZNS hoặc ZNS Transactional

// Zalo Pay Mini App – lấy tại: https://developers.zalo.me/app/<APP_ID>/setting
// key2 dùng để tạo MAC signature (KHÔNG để client-side)
define( 'MIRA_ZALO_APP_ID',   defined('ZALO_APP_ID')   ? ZALO_APP_ID   : 'YOUR_ZALO_APP_ID' );
define( 'MIRA_ZALO_APP_KEY2', defined('ZALO_APP_KEY2') ? ZALO_APP_KEY2 : 'YOUR_ZALO_KEY2' );
// Tiền đặt cọc mặc định (VND) – chỉnh theo giá phòng thấp nhất
define( 'MIRA_DEPOSIT_AMOUNT', 200000 );
// ─────────────────────────────────────────────────────────────────────────────

class Mira_Booking_API {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    public function register_routes() {
        register_rest_route( 'mira/v1', '/booking', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_booking' ],
            'permission_callback' => '__return_true',  // Public endpoint – rate limiting qua Cloudflare
            'args'                => $this->get_booking_args(),
        ]);

        // Tạo signed payment order (MAC server-side)
        register_rest_route( 'mira/v1', '/payment/order', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_create_payment_order' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'hotelName' => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
                'checkIn'   => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
                'name'      => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
                'phone'     => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            ],
        ]);

        // Health check
        register_rest_route( 'mira/v1', '/ping', [
            'methods'             => 'GET',
            'callback'            => fn() => new WP_REST_Response(['status' => 'ok'], 200),
            'permission_callback' => '__return_true',
        ]);
    }

    private function get_booking_args() {
        return [
            'hotelId'          => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'hotelName'        => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'checkIn'          => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'checkOut'         => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'adults'           => [ 'required' => false, 'default' => 2,    'sanitize_callback' => 'absint' ],
            'children'         => [ 'required' => false, 'default' => 0,    'sanitize_callback' => 'absint' ],
            'name'             => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'phone'            => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'note'             => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'sanitize_textarea_field' ],
            'zaloUserId'       => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
            'zaloName'         => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
            'submittedAt'      => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
            'zalopayOrderId'   => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
            'zalopayStatus'    => [ 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ],
        ];
    }

    // ─── Tạo signed payment order cho Zalo Pay ─────────────────────────────────
    public function handle_create_payment_order( WP_REST_Request $request ) {
        $key2 = MIRA_ZALO_APP_KEY2;
        if ( $key2 === 'YOUR_ZALO_KEY2' ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Zalo Pay chưa được cấu hình. Vui lòng liên hệ admin.',
            ], 503);
        }

        $data      = $request->get_params();
        $app_id    = MIRA_ZALO_APP_ID;
        $amount    = MIRA_DEPOSIT_AMOUNT;
        $desc      = "Đặt cọc phòng – " . $data['hotelName'] . " – " . $data['checkIn'];
        $extradata = wp_json_encode([
            'name'      => $data['name'],
            'phone'     => $data['phone'],
            'hotelName' => $data['hotelName'],
            'checkIn'   => $data['checkIn'],
        ]);

        $item = wp_json_encode([[
            'itemid'       => 'deposit-1',
            'itemname'     => 'Đặt cọc phòng ' . $data['hotelName'],
            'itemprice'    => $amount,
            'itemquantity' => 1,
        ]]);

        // MAC = HMAC_SHA256(appId|amount|item|desc|extradata, key2)
        $mac_data = $app_id . '|' . $amount . '|' . $item . '|' . $desc . '|' . $extradata;
        $mac      = hash_hmac( 'sha256', $mac_data, $key2 );

        return new WP_REST_Response([
            'success'   => true,
            'amount'    => $amount,
            'item'      => json_decode( $item ),
            'desc'      => $desc,
            'mac'       => $mac,
            'extradata' => $extradata,
            'appId'     => $app_id,
        ], 200);
    }

    public function handle_booking( WP_REST_Request $request ) {
        $data = $request->get_params();

        // Validate ngày
        if ( $data['checkIn'] >= $data['checkOut'] ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Ngày trả phòng phải sau ngày nhận phòng.',
            ], 400);
        }

        // Validate SĐT Việt Nam
        if ( ! preg_match('/^(0|\+84)\d{9}$/', $data['phone']) ) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Số điện thoại không hợp lệ.',
            ], 400);
        }

        // Lưu vào WP custom post type (optional – để quản lý trong dashboard)
        $post_id = $this->save_booking_to_db( $data );

        // Gửi email xác nhận cho khách
        $this->send_confirmation_email( $data );

        // Gửi email thông báo cho admin
        $this->send_admin_email( $data );

        // Gửi Zalo OA notification (nếu có zaloUserId)
        $zalo_sent = false;
        if ( ! empty( $data['zaloUserId'] ) ) {
            $zalo_sent = $this->send_zalo_notification( $data );
        }

        return new WP_REST_Response([
            'success'   => true,
            'message'   => 'Đặt phòng thành công!',
            'bookingId' => $post_id,
            'zaloSent'  => $zalo_sent,
        ], 201);
    }

    // ─── Lưu vào DB ────────────────────────────────────────────────────────────
    private function save_booking_to_db( $data ) {
        $post_id = wp_insert_post([
            'post_type'   => 'mira_booking',
            'post_title'  => "[{$data['hotelName']}] {$data['name']} – {$data['checkIn']}",
            'post_status' => 'publish',
            'meta_input'  => [
                '_mira_hotel_id'       => $data['hotelId'],
                '_mira_hotel_name'     => $data['hotelName'],
                '_mira_check_in'       => $data['checkIn'],
                '_mira_check_out'      => $data['checkOut'],
                '_mira_adults'         => $data['adults'],
                '_mira_children'       => $data['children'],
                '_mira_name'           => $data['name'],
                '_mira_phone'          => $data['phone'],
                '_mira_note'           => $data['note'],
                '_mira_zalo_id'        => $data['zaloUserId'] ?? '',
                '_mira_source'         => 'zalo_miniapp',
                '_mira_zalopay_order'  => $data['zalopayOrderId'] ?? '',
                '_mira_zalopay_status' => $data['zalopayStatus'] ?? 'none',
            ],
        ]);
        return $post_id;
    }

    // ─── Email xác nhận cho khách ───────────────────────────────────────────────
    private function send_confirmation_email( $data ) {
        $to      = MIRA_ADMIN_EMAIL; // Gửi về admin để forward hoặc tự trả lời
        $subject = "✅ Xác nhận đặt phòng – {$data['hotelName']}";

        $nights  = ( strtotime($data['checkOut']) - strtotime($data['checkIn']) ) / 86400;

        $body = "
<html><body style='font-family: Arial, sans-serif; color: #333;'>
<div style='max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;'>
  <div style='background: #1A2535; padding: 24px; text-align: center;'>
    <h1 style='color: #C9A84C; margin: 0; font-size: 22px;'>Mira Quy Nhơn</h1>
    <p style='color: rgba(255,255,255,0.7); margin: 8px 0 0;'>Xác nhận đặt phòng</p>
  </div>
  <div style='padding: 24px;'>
    <p>Kính gửi <strong>{$data['name']}</strong>,</p>
    <p>Chúng tôi đã nhận được yêu cầu đặt phòng của bạn. Nhân viên Mira sẽ liên hệ xác nhận trong vòng 30 phút.</p>

    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
      <tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Khách sạn</td><td style='padding: 8px;'>{$data['hotelName']}</td></tr>
      <tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Nhận phòng</td><td style='padding: 8px;'>{$data['checkIn']}</td></tr>
      <tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Trả phòng</td><td style='padding: 8px;'>{$data['checkOut']} ({$nights} đêm)</td></tr>
      <tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Số khách</td><td style='padding: 8px;'>{$data['adults']} người lớn, {$data['children']} trẻ em</td></tr>
      <tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Điện thoại</td><td style='padding: 8px;'>{$data['phone']}</td></tr>
      " . ($data['note'] ? "<tr><td style='padding: 8px; background: #f0f0f0; font-weight: bold;'>Ghi chú</td><td style='padding: 8px;'>{$data['note']}</td></tr>" : "") . "
    </table>

    <p style='color: #666; font-size: 13px;'>Cần hỗ trợ gấp: <strong>0256 XXX XXXX</strong> hoặc chat Zalo OA <strong>Mira Quy Nhon</strong></p>
  </div>
  <div style='background: #1A2535; padding: 16px; text-align: center;'>
    <p style='color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;'>miraquynhon.com · Quy Nhơn, Bình Định</p>
  </div>
</div>
</body></html>
        ";

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            "From: " . MIRA_FROM_NAME . " <" . MIRA_FROM_EMAIL . ">",
        ];

        wp_mail( $to, $subject, $body, $headers );
    }

    // ─── Email cho admin ────────────────────────────────────────────────────────
    private function send_admin_email( $data ) {
        $to      = MIRA_ADMIN_EMAIL;
        $subject = "🔔 Đặt phòng mới [{$data['hotelName']}] – {$data['name']} – {$data['checkIn']}";
        $nights  = ( strtotime($data['checkOut']) - strtotime($data['checkIn']) ) / 86400;

        $body = "
ĐẶT PHÒNG MỚI TỪ ZALO MINI APP
================================
Khách sạn : {$data['hotelName']}
Ngày nhận : {$data['checkIn']}
Ngày trả  : {$data['checkOut']} ({$nights} đêm)
Người lớn : {$data['adults']}
Trẻ em    : {$data['children']}
--------------------------------
Họ tên    : {$data['name']}
Điện thoại: {$data['phone']}
Zalo ID   : " . ($data['zaloUserId'] ?? 'Không có') . "
Ghi chú   : " . ($data['note'] ?: 'Không có') . "
================================
Nguồn     : Zalo Mini App
Thời gian : " . current_time('d/m/Y H:i') . "
        ";

        wp_mail( $to, $subject, $body );
    }

    // ─── Zalo OA Notification ───────────────────────────────────────────────────
    private function send_zalo_notification( $data ) {
        // Xem hướng dẫn lấy Access Token tại:
        // https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-oa

        $token = MIRA_ZALO_OA_TOKEN;
        if ( $token === 'YOUR_OA_ACCESS_TOKEN' ) {
            error_log('[Mira] Chưa cấu hình Zalo OA Access Token');
            return false;
        }

        $nights = ( strtotime($data['checkOut']) - strtotime($data['checkIn']) ) / 86400;

        // Dùng Zalo Message API – gửi tin nhắn văn bản cho follower
        $payload = [
            'recipient' => [ 'user_id' => $data['zaloUserId'] ],
            'message'   => [
                'text' => "✅ Mira Quy Nhơn xác nhận đặt phòng\n\n"
                        . "🏨 {$data['hotelName']}\n"
                        . "📅 {$data['checkIn']} → {$data['checkOut']} ({$nights} đêm)\n"
                        . "👥 {$data['adults']} người lớn\n\n"
                        . "Nhân viên sẽ gọi xác nhận trong 30 phút.\n"
                        . "☎️ Hotline: 0256 XXX XXXX",
            ],
        ];

        $response = wp_remote_post(
            'https://openapi.zalo.me/v2.0/oa/message',
            [
                'headers' => [
                    'access_token' => $token,
                    'Content-Type' => 'application/json',
                ],
                'body'    => wp_json_encode( $payload ),
                'timeout' => 10,
            ]
        );

        if ( is_wp_error( $response ) ) {
            error_log( '[Mira Zalo] ' . $response->get_error_message() );
            return false;
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( isset( $body['error'] ) && $body['error'] !== 0 ) {
            error_log( '[Mira Zalo] Lỗi: ' . $body['message'] );
            return false;
        }

        return true;
    }
}

// Đăng ký custom post type để lưu đơn đặt phòng trong dashboard
add_action( 'init', function () {
    register_post_type( 'mira_booking', [
        'label'  => 'Đặt phòng',
        'public' => false,
        'show_ui' => true,
        'menu_icon' => 'dashicons-calendar-alt',
        'supports' => [ 'title' ],
        'labels' => [
            'name'          => 'Quản lý đặt phòng',
            'singular_name' => 'Đơn đặt phòng',
            'all_items'     => 'Tất cả đơn',
        ],
    ]);
});

new Mira_Booking_API();
