<?php
/**
 * Plugin Name: Mira Booking API
 * Description: Custom REST API cho Zalo Mini App – nhận đặt phòng, gửi email + Zalo OA notification
 * Version: 1.1.0
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
// App Secret Key – dùng để đổi phoneToken lấy số điện thoại thật
// Lấy tại: https://developers.zalo.me/app/<APP_ID>/setting
define( 'MIRA_ZALO_APP_SECRET', defined('ZALO_APP_SECRET') ? ZALO_APP_SECRET : 'YOUR_APP_SECRET' );
define( 'MIRA_ZALO_APP_ID',     defined('ZALO_APP_ID')     ? ZALO_APP_ID     : 'YOUR_ZALO_APP_ID' );
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

        // Health check
        register_rest_route( 'mira/v1', '/ping', [
            'methods'             => 'GET',
            'callback'            => fn() => new WP_REST_Response(['status' => 'ok'], 200),
            'permission_callback' => '__return_true',
        ]);

        // Lưu thông tin user kết nối OA (lưu lần đầu) hoặc cập nhật (nếu đã tồn tại)
        register_rest_route( 'mira/v1', '/user-connect', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_user_connect' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'zaloUserId'  => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
                'displayName' => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'sanitize_text_field' ],
                'avatar'      => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'esc_url_raw' ],
                'phoneToken'  => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'sanitize_text_field' ],
            ],
        ]);

        // Kiểm tra trạng thái kết nối của một user
        register_rest_route( 'mira/v1', '/user-connect/(?P<zaloUserId>[\w\-]+)', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'handle_get_user' ],
            'permission_callback' => '__return_true',
            'args'                => [
                'zaloUserId' => [ 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ],
            ],
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
        ];
    }

    public function handle_booking( WP_REST_Request $request ) {( WP_REST_Request $request ) {
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

// ─── Tạo bảng wp_mira_users khi kích hoạt plugin ────────────────────────────────
register_activation_hook( __FILE__, 'mira_create_users_table' );
function mira_create_users_table() {
    global $wpdb;
    $table   = $wpdb->prefix . 'mira_users';
    $charset = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS {$table} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        zalo_user_id VARCHAR(64) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        phone VARCHAR(20) NOT NULL DEFAULT '',
        avatar_url TEXT NOT NULL DEFAULT '',
        loyalty_points INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY zalo_user_id (zalo_user_id)
    ) {$charset};";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}

// ─── User Connect handlers (methods added next) ──────────────────────────────
class Mira_User_Connect {

    /** POST /mira/v1/user-connect */
    public static function handle_user_connect( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'mira_users';

        $zalo_user_id = $request->get_param('zaloUserId');
        $display_name = $request->get_param('displayName');
        $avatar       = $request->get_param('avatar');
        $phone_token  = $request->get_param('phoneToken');

        // Đổi phoneToken lấy số điện thoại thật (nếu đã cấu hình App Secret)
        $phone = '';
        if ( $phone_token && MIRA_ZALO_APP_SECRET !== 'YOUR_APP_SECRET' ) {
            $phone = self::exchange_phone_token( $phone_token );
        }

        $existing = $wpdb->get_row(
            $wpdb->prepare( "SELECT id, phone FROM {$table} WHERE zalo_user_id = %s", $zalo_user_id )
        );

        if ( $existing ) {
            // Cập nhật nếu số điện thoại mới
            $update_data = [ 'display_name' => $display_name ];
            if ( $phone ) $update_data['phone'] = $phone;
            if ( $avatar ) $update_data['avatar_url'] = $avatar;
            $wpdb->update( $table, $update_data, [ 'zalo_user_id' => $zalo_user_id ] );
            return new WP_REST_Response([ 'success' => true, 'isNew' => false ], 200);
        }

        // Thêm mới
        $wpdb->insert( $table, [
            'zalo_user_id' => $zalo_user_id,
            'display_name' => $display_name,
            'phone'        => $phone,
            'avatar_url'   => $avatar,
        ]);

        return new WP_REST_Response([ 'success' => true, 'isNew' => true ], 201);
    }

    /** GET /mira/v1/user-connect/{zaloUserId} */
    public static function handle_get_user( WP_REST_Request $request ) {
        global $wpdb;
        $table        = $wpdb->prefix . 'mira_users';
        $zalo_user_id = $request->get_param('zaloUserId');

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT display_name, loyalty_points FROM {$table} WHERE zalo_user_id = %s",
                $zalo_user_id
            )
        );

        if ( ! $row ) {
            return new WP_REST_Response([ 'connected' => false ], 200);
        }

        return new WP_REST_Response([
            'connected'     => true,
            'displayName'   => $row->display_name,
            'loyaltyPoints' => (int) $row->loyalty_points,
        ], 200);
    }

    /**
     * Đổi phoneToken lấy SĐT thật qua Zalo API.
     * Docs: https://developers.zalo.me/docs/mini-app/server-api/user/get-user-phone-number
     *
     * @param string $token
     * @return string Số điện thoại (chuẩn hoá) hoặc chuỗi rỗng nếu thất bại
     */
    private static function exchange_phone_token( string $token ): string {
        $response = wp_remote_post(
            'https://oauth.zaloapp.com/v4/oa/user/getinfobyphonetoken',
            [
                'headers' => [ 'Content-Type' => 'application/json' ],
                'body'    => wp_json_encode([
                    'app_id'         => MIRA_ZALO_APP_ID,
                    'app_secret_key' => MIRA_ZALO_APP_SECRET,
                    'phone_token'    => $token,
                ]),
                'timeout' => 8,
            ]
        );

        if ( is_wp_error( $response ) ) {
            error_log( '[Mira] phone token exchange error: ' . $response->get_error_message() );
            return '';
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( isset( $body['error'] ) && $body['error'] !== 0 ) {
            error_log( '[Mira] phone token exchange: ' . ( $body['message'] ?? 'unknown error' ) );
            return '';
        }

        // Chuẩn hoá về dạng 0xxxxxxxxx
        $phone = $body['data']['number'] ?? '';
        if ( str_starts_with( $phone, '+84' ) ) {
            $phone = '0' . substr( $phone, 3 );
        }
        return sanitize_text_field( $phone );
    }
}

// Đăng ký các phương thức sau khi plugin khởi động
add_action( 'rest_api_init', function () {
    register_rest_route( 'mira/v1', '/user-connect', [
        'methods'             => 'POST',
        'callback'            => [ 'Mira_User_Connect', 'handle_user_connect' ],
        'permission_callback' => '__return_true',
        'args'                => [
            'zaloUserId'  => [ 'required' => true,  'sanitize_callback' => 'sanitize_text_field' ],
            'displayName' => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'sanitize_text_field' ],
            'avatar'      => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'esc_url_raw' ],
            'phoneToken'  => [ 'required' => false, 'default' => '',   'sanitize_callback' => 'sanitize_text_field' ],
        ],
    ]);
    register_rest_route( 'mira/v1', '/user-connect/(?P<zaloUserId>[\w\-]+)', [
        'methods'             => 'GET',
        'callback'            => [ 'Mira_User_Connect', 'handle_get_user' ],
        'permission_callback' => '__return_true',
    ]);
});
