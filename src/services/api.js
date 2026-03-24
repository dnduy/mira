import axios from "axios";

const WP_BASE = "https://miraquynhon.com/wp-json";
const WP_V2 = `${WP_BASE}/wp/v2`;
const MIRA_API = `${WP_BASE}/mira/v1`;

// ─── Axios instance ───────────────────────────────────────────────────────────
const wpClient = axios.create({
  baseURL: WP_V2,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const decodeEntities = (str = "") =>
  str
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");

const stripHtml = (html = "") => decodeEntities(html.replace(/<[^>]*>/g, "").trim());

// ─── Dữ liệu tĩnh khách sạn (scrape từ miraquynhon.com) ──────────────────────
const HOTELS_STATIC = [
  {
    id: 1,
    slug: "mira-quy-nhon",
    name: "Mira Quy Nhơn Hotel",
    dist: "100m tới biển",
    stars: 3,
    priceFrom: 450000,
    tag: "Phổ biến nhất",
    tagColor: "#E74C3C",
    emoji: "🌊",
    addr: "11A Ngô Mây, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=11A+Ng%C3%B4+M%C3%A2y+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Khách sạn Mira Quy Nhơn tọa lạc ngay trung tâm thành phố, cách bãi biển Quy Nhơn chỉ 100m. Không gian hiện đại, dịch vụ chu đáo.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
      "https://miraquynhon.com/wp-content/uploads/2023/03/14e5dd90d87705295c664.jpg",
      "https://miraquynhon.com/wp-content/uploads/2024/06/khach-san-co-phong-gia-dinh-quy-nhon-mira-hotel.jpg",
      "https://miraquynhon.com/wp-content/uploads/2022/04/z3301549309035_0f426f1f36c9b09f1ae434f4e0f5f0e0.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-quy-nhon/",
    rooms: [
      {
        id: "mqn-twin",
        name: "Twin Room",
        slug: "twin-room",
        beds: "2 giường đơn",
        maxGuests: 2,
        size: 22,
        priceFrom: 450000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/04/z3301549309035_0f426f1f36c9b09f1ae434f4e0f5f0e0.jpg",
        images: [
          "https://miraquynhon.com/wp-content/uploads/2022/04/z3301549309035_0f426f1f36c9b09f1ae434f4e0f5f0e0.jpg",
          "https://miraquynhon.com/wp-content/uploads/2023/03/14e5dd90d87705295c664.jpg",
        ],
        excerpt: "Phòng Twin thoáng đãng với 2 giường đơn, phù hợp cho cặp bạn bè hoặc gia đình đi du lịch. View thành phố hoặc biển.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV", "🧴 Đồ dùng VS cá nhân"],
        link: "https://miraquynhon.com/phong/twin-room/",
      },
      {
        id: "mqn-double",
        name: "Double Room",
        slug: "double-room",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 22,
        priceFrom: 480000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
        images: [
          "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
        ],
        excerpt: "Phòng Double lãng mạn với 1 giường đôi cỡ lớn, thiết kế ấm cúng, lý tưởng cho cặp đôi.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🛁 Bồn tắm", "📺 Smart TV", "☕ Máy pha cà phê"],
        link: "https://miraquynhon.com/phong/double-room-3/",
      },
      {
        id: "mqn-deluxe-triple",
        name: "Deluxe Triple Room",
        slug: "phong-triple",
        beds: "3 giường đơn",
        maxGuests: 3,
        size: 28,
        priceFrom: 650000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2024/06/khach-san-co-phong-gia-dinh-quy-nhon-mira-hotel.jpg",
        images: [
          "https://miraquynhon.com/wp-content/uploads/2024/06/khach-san-co-phong-gia-dinh-quy-nhon-mira-hotel.jpg",
        ],
        excerpt: "Phòng Deluxe Triple rộng rãi cho 3 người, đầy đủ tiện nghi cao cấp, ban công view biển hoặc thành phố.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV", "🧴 Đồ VS cao cấp", "🌅 Ban công"],
        link: "https://miraquynhon.com/phong/phong-triple/",
      },
      {
        id: "mqn-family",
        name: "Family Room",
        slug: "phong-family-mira-quy-nhon",
        beds: "1 đôi + 2 đơn",
        maxGuests: 4,
        size: 35,
        priceFrom: 850000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2024/06/khach-san-co-phong-gia-dinh-quy-nhon-mira-hotel.jpg",
        images: [
          "https://miraquynhon.com/wp-content/uploads/2024/06/khach-san-co-phong-gia-dinh-quy-nhon-mira-hotel.jpg",
          "https://miraquynhon.com/wp-content/uploads/2023/03/14e5dd90d87705295c664.jpg",
        ],
        excerpt: "Phòng Family rộng 35m² dành cho gia đình, kết hợp 1 giường đôi và 2 giường đơn. Không gian sinh hoạt chung thoải mái.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Phòng tắm lớn", "📺 Smart TV 50\"", "🧸 Tiện ích trẻ em", "🌅 Ban công rộng"],
        link: "https://miraquynhon.com/phong/phong-family-mira-quy-nhon/",
      },
      {
        id: "mqn-deluxe-double",
        name: "Deluxe Double Room",
        slug: "deluxe-double-mira-quy-nhon",
        beds: "1 giường King",
        maxGuests: 2,
        size: 30,
        priceFrom: 750000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
        images: [
          "https://miraquynhon.com/wp-content/uploads/2023/03/092f68dadf5b02055b4a.jpg",
          "https://miraquynhon.com/wp-content/uploads/2022/04/z3301549309035_0f426f1f36c9b09f1ae434f4e0f5f0e0.jpg",
        ],
        excerpt: "Phòng Deluxe Double cao cấp nhất tại Mira Quy Nhơn – giường King size, nội thất sang trọng, view biển tuyệt đẹp.",
        amenities: ["📶 Wifi tốc độ cao", "❄️ Điều hòa inverter", "🛁 Bồn tắm + vòi sen", "📺 Smart TV 55\"", "☕ Bộ pha trà/cà phê", "🌊 View biển"],
        link: "https://miraquynhon.com/phong/deluxe-double-mira-quy-nhon/",
      },
    ],
  },
  {
    id: 2,
    slug: "mira-boutique-hotel",
    name: "Mira Boutique Hotel",
    dist: "150m tới biển",
    stars: 3,
    priceFrom: 550000,
    tag: "Boutique",
    tagColor: "#8E44AD",
    emoji: "💐",
    addr: "20 Hàn Mặc Tử, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=20+H%C3%A0n+M%E1%BA%B7c+T%E1%BB%AD+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Mira Boutique Hotel – không gian phong cách boutique tinh tế, kết hợp hài hòa giữa thiết kế hiện đại và nét duyên dáng vùng biển miền Trung.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg",
      "https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-boutique-hotel/",
    rooms: [
      {
        id: "mbt-standard-double",
        name: "Standard Double",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 22,
        priceFrom: 550000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg"],
        excerpt: "Phòng Standard Double với phong cách boutique ấm cúng, giường đôi Queen size, tiện nghi hiện đại.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV", "🧴 Đồ VS cá nhân"],
        link: "https://miraquynhon.com/loai-phong/mira-boutique-hotel/",
      },
      {
        id: "mbt-deluxe-double",
        name: "Deluxe Double",
        beds: "1 giường King",
        maxGuests: 2,
        size: 28,
        priceFrom: 720000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg"],
        excerpt: "Phòng Deluxe Double boutique cao cấp với giường King, thiết kế nghệ thuật độc đáo, ban công riêng.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🛁 Bồn tắm", "📺 Smart TV", "🌅 Ban công", "☕ Minibar"],
        link: "https://miraquynhon.com/loai-phong/mira-boutique-hotel/",
      },
      {
        id: "mbt-twin",
        name: "Twin Room",
        beds: "2 giường đơn",
        maxGuests: 2,
        size: 22,
        priceFrom: 550000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2024/11/c033d4726d29d5778c38.jpg"],
        excerpt: "Phòng Twin phong cách boutique với 2 giường đơn, phù hợp cho bạn bè cùng đi du lịch.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV"],
        link: "https://miraquynhon.com/loai-phong/mira-boutique-hotel/",
      },
    ],
  },
  {
    id: 3,
    slug: "mira-grand",
    name: "Mira Grand Hotel",
    dist: "200m tới biển",
    stars: 3,
    priceFrom: 480000,
    tag: "Grand",
    tagColor: "#1D9E75",
    emoji: "🏛️",
    addr: "7 Nguyễn Thị Định, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=7+Nguy%E1%BB%85n+Th%E1%BB%8B+%C4%90%E1%BB%8Bnh+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Mira Grand Hotel – quy mô lớn nhất hệ thống, phòng ốc rộng rãi, view biển thoáng đãng, phù hợp cho các đoàn gia đình và tập thể.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg",
      "https://miraquynhon.com/wp-content/uploads/2022/03/z3269498974606_9a347f5a53dc723b8bf7b3ec7df25762.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-grand/",
    rooms: [
      {
        id: "mgr-standard",
        name: "Standard Room",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 24,
        priceFrom: 480000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg"],
        excerpt: "Phòng Standard rộng rãi tại Mira Grand, không gian thoáng đãng, đầy đủ tiện nghi cơ bản.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV"],
        link: "https://miraquynhon.com/loai-phong/mira-grand/",
      },
      {
        id: "mgr-superior",
        name: "Superior Room",
        beds: "1 giường King",
        maxGuests: 2,
        size: 28,
        priceFrom: 620000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/03/z3269498974606_9a347f5a53dc723b8bf7b3ec7df25762.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2022/03/z3269498974606_9a347f5a53dc723b8bf7b3ec7df25762.jpg"],
        excerpt: "Phòng Superior tại Mira Grand với giường King size, tầm nhìn thoáng ra thành phố hoặc biển xa.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🛁 Bồn tắm", "📺 Smart TV", "🌅 View biển"],
        link: "https://miraquynhon.com/loai-phong/mira-grand/",
      },
      {
        id: "mgr-family",
        name: "Family Suite",
        beds: "1 đôi + 2 đơn",
        maxGuests: 5,
        size: 45,
        priceFrom: 980000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/02/Tong-quan-khach-san-tu-tren-cao.jpg"],
        excerpt: "Family Suite lớn nhất Mira Grand – phù hợp đoàn gia đình đông, phòng ngủ riêng biệt, phòng khách rộng.",
        amenities: ["📶 Wifi", "❄️ Điều hòa 2 cục", "🚿 2 Phòng tắm", "📺 2 Smart TV", "🧸 Góc vui chơi trẻ em"],
        link: "https://miraquynhon.com/loai-phong/mira-grand/",
      },
    ],
  },
  {
    id: 4,
    slug: "mira-bai-xep",
    name: "Mira Bãi Xếp",
    dist: "Ngay bãi biển",
    stars: 2,
    priceFrom: 380000,
    tag: "Homestay",
    tagColor: "#C9A84C",
    emoji: "🌿",
    addr: "Bãi Xếp, Ghềnh Ráng, Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=B%C3%A3i+X%E1%BA%BFp+Gh%E1%BB%81nh+R%C3%A1ng+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Mira Bãi Xếp – homestay ngay làng chài Bãi Xếp, nơi bối cảnh của bộ phim nổi tiếng 'Tôi thấy hoa vàng trên cỏ xanh'. Trải nghiệm hoang sơ, yên tĩnh.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/04/Phong-dbl-Princess-co-ban-cong-view-1-goc-bien.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2022/04/Phong-dbl-Princess-co-ban-cong-view-1-goc-bien.jpg",
      "https://miraquynhon.com/wp-content/uploads/2022/03/84645599_136250864523311_7639000399982100480_n.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-bai-xep/",
    rooms: [
      {
        id: "mbx-princess",
        name: "Princess Room",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 20,
        priceFrom: 380000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/04/Phong-dbl-Princess-co-ban-cong-view-1-goc-bien.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2022/04/Phong-dbl-Princess-co-ban-cong-view-1-goc-bien.jpg"],
        excerpt: "Phòng Princess mang đậm hơi thở làng chài – ban công nhỏ view biển, nghe sóng vỗ ngay trước cửa.",
        amenities: ["📶 Wifi", "❄️ Quạt trần", "🚿 Tắm đứng", "🌊 View biển", "🌅 Ban công"],
        link: "https://miraquynhon.com/loai-phong/mira-bai-xep/",
      },
      {
        id: "mbx-bungalow",
        name: "Bungalow",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 25,
        priceFrom: 480000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/03/84645599_136250864523311_7639000399982100480_n.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2022/03/84645599_136250864523311_7639000399982100480_n.jpg"],
        excerpt: "Bungalow riêng biệt hoàn toàn, nằm ngay bờ biển Bãi Xếp, không gian riêng tư tuyệt đối, cát trắng bước ra là biển.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm ngoài trời", "🌊 Ngay mép biển", "🔒 Riêng biệt"],
        link: "https://miraquynhon.com/loai-phong/mira-bai-xep/",
      },
    ],
  },
  {
    id: 5,
    slug: "mira-aloha",
    name: "Mira Aloha Hotel",
    dist: "200m tới biển",
    stars: 3,
    priceFrom: 420000,
    tag: "Giá tốt",
    tagColor: "#2980B9",
    emoji: "🌺",
    addr: "50 Lê Lợi, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=50+L%C3%AA+L%E1%BB%A3i+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Mira Aloha Hotel – giá phòng hợp lý, vị trí thuận tiện, gần chợ đêm và các hàng ăn đặc sản Quy Nhơn. Lựa chọn tối ưu cho khách du lịch tiết kiệm.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg",
      "https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-aloha/",
    rooms: [
      {
        id: "mal-standard",
        name: "Standard Double",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 20,
        priceFrom: 420000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg"],
        excerpt: "Phòng Standard thoải mái, giá hợp lý, đầy đủ tiện nghi cơ bản – lý tưởng cho khách du lịch tiết kiệm.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV"],
        link: "https://miraquynhon.com/loai-phong/mira-aloha/",
      },
      {
        id: "mal-twin",
        name: "Twin Room",
        beds: "2 giường đơn",
        maxGuests: 2,
        size: 20,
        priceFrom: 420000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/08/gioi-thieu-ve-mira-aloha-quy-nhon-miraquynhon.jpg"],
        excerpt: "Phòng Twin 2 giường đơn, phù hợp bạn bè hoặc gia đình, giá cực kỳ cạnh tranh.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV"],
        link: "https://miraquynhon.com/loai-phong/mira-aloha/",
      },
      {
        id: "mal-superior",
        name: "Superior Room",
        beds: "1 giường King",
        maxGuests: 2,
        size: 25,
        priceFrom: 580000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2023/02/3f67d012e5fc3fa266ed9-1-scaled-1.jpg"],
        excerpt: "Phòng Superior Aloha nâng cấp – giường King, nội thất đẹp hơn, phù hợp cho cặp đôi muốn không gian thoải mái.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🛁 Bồn tắm", "📺 Smart TV", "☕ Minibar"],
        link: "https://miraquynhon.com/loai-phong/mira-aloha/",
      },
    ],
  },
  {
    id: 6,
    slug: "mira-eco",
    name: "Mira Eco Hotel",
    dist: "50m tới biển",
    stars: 2,
    priceFrom: 350000,
    tag: "Gần biển nhất",
    tagColor: "#16A085",
    emoji: "🌱",
    addr: "24 Nguyễn Như Đỗ, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=24+Nguy%E1%BB%85n+Nh%C6%B0+%C4%90%E1%BB%97+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Mira Eco Hotel – cơ sở gần biển nhất trong hệ thống, chỉ 50m từ cửa khách sạn ra bờ cát. Lý tưởng cho những ai muốn tận hưởng biển mỗi sáng.",
    thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/07/Family1.jpg",
    images: [
      "https://miraquynhon.com/wp-content/uploads/2022/07/Family1.jpg",
      "https://miraquynhon.com/wp-content/uploads/2025/04/1000001899-1024x768.jpg",
    ],
    link: "https://miraquynhon.com/loai-phong/mira-eco/",
    rooms: [
      {
        id: "mec-standard",
        name: "Eco Standard",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 18,
        priceFrom: 350000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2022/07/Family1.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2022/07/Family1.jpg"],
        excerpt: "Phòng Eco Standard nhỏ gọn, thân thiện môi trường, chỉ 50m ra biển – lý tưởng cho người yêu thiên nhiên tiết kiệm.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "🌿 Thân thiện MT"],
        link: "https://miraquynhon.com/loai-phong/mira-eco/",
      },
      {
        id: "mec-family",
        name: "Eco Family",
        beds: "1 đôi + 2 đơn",
        maxGuests: 4,
        size: 32,
        priceFrom: 650000,
        thumbnail: "https://miraquynhon.com/wp-content/uploads/2025/04/1000001899-1024x768.jpg",
        images: ["https://miraquynhon.com/wp-content/uploads/2025/04/1000001899-1024x768.jpg"],
        excerpt: "Phòng Eco Family rộng rãi cho cả gia đình, cách biển chỉ 50m, bãi tắm riêng gần như trước cửa.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 2 Phòng tắm", "📺 Smart TV", "🌿 Thân thiện MT", "🌊 Gần biển nhất"],
        link: "https://miraquynhon.com/loai-phong/mira-eco/",
      },
    ],
  },
  {
    id: 7,
    slug: "xavia-hotel",
    name: "Xavia Hotel Quy Nhơn",
    dist: "200m tới biển",
    stars: 3,
    priceFrom: 500000,
    tag: "3 Sao",
    tagColor: "#7F8C8D",
    emoji: "⭐",
    addr: "24-25 Bùi Tư Toàn, TP Quy Nhơn",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=24+B%C3%B9i+T%C6%B0+To%C3%A0n+Quy+Nh%C6%A1n+B%C3%ACnh+%C4%90%E1%BB%8Bnh",
    excerpt: "Xavia Hotel – khách sạn 3 sao sang trọng tại Quy Nhơn, thiết kế hiện đại, phòng đầy đủ tiện nghi cao cấp, đội ngũ phục vụ chuyên nghiệp.",
    thumbnail: "https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg",
    images: [
      "https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg",
    ],
    link: "https://xaviaquynhon.com/",
    rooms: [
      {
        id: "xav-standard",
        name: "Standard Room",
        beds: "1 giường đôi",
        maxGuests: 2,
        size: 24,
        priceFrom: 500000,
        thumbnail: "https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg",
        images: ["https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg"],
        excerpt: "Phòng Standard Xavia sang trọng với thiết kế hiện đại, đầy đủ tiện nghi 3 sao cao cấp.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV", "🧴 Đồ VS cao cấp"],
        link: "https://xaviaquynhon.com/",
      },
      {
        id: "xav-deluxe",
        name: "Deluxe Room",
        beds: "1 giường King",
        maxGuests: 2,
        size: 30,
        priceFrom: 700000,
        thumbnail: "https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg",
        images: ["https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg"],
        excerpt: "Phòng Deluxe Xavia – nội thất sang trọng nhất khách sạn, giường King, minibar, cửa sổ rộng view thành phố.",
        amenities: ["📶 Wifi", "❄️ Điều hòa inverter", "🛁 Bồn tắm", "📺 Smart TV 55\"", "☕ Minibar", "🌆 View thành phố"],
        link: "https://xaviaquynhon.com/",
      },
      {
        id: "xav-twin",
        name: "Twin Room",
        beds: "2 giường đơn",
        maxGuests: 2,
        size: 24,
        priceFrom: 500000,
        thumbnail: "https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg",
        images: ["https://xaviaquynhon.com/wp-content/uploads/2023/04/gioi-thieu.jpg"],
        excerpt: "Phòng Twin Xavia 3 sao cho 2 khách, nội thất hiện đại, phù hợp bạn bè hoặc đồng nghiệp.",
        amenities: ["📶 Wifi", "❄️ Điều hòa", "🚿 Tắm đứng", "📺 Smart TV"],
        link: "https://xaviaquynhon.com/",
      },
    ],
  },
];

// ─── API calls ────────────────────────────────────────────────────────────────
export const wpApi = {
  /**
   * Danh sách khách sạn – dùng data tĩnh vì WP không expose /loai-phong/ taxonomy qua REST
   */
  getHotels: async () => {
    return HOTELS_STATIC;
  },

  /**
   * Chi tiết khách sạn theo id (1-7)
   */
  getHotelDetail: async (id) => {
    const hotel = HOTELS_STATIC.find((h) => h.id === parseInt(id));
    return hotel || HOTELS_STATIC[0];
  },

  /**
   * Bài viết khám phá Quy Nhơn (từ WP posts categories)
   */
  getExplorePosts: async () => {
    const res = await wpClient.get("/posts", {
      params: {
        per_page: 12,
        _embed: 1,
      },
    });
    return res.data.map((post) => ({
      id: post.id,
      title: stripHtml(post.title?.rendered || ""),
      excerpt: stripHtml(post.excerpt?.rendered || ""),
      slug: post.slug,
      date: post.date,
      thumbnail:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium?.source_url ||
        null,
    }));
  },

  getPostDetail: async (id) => {
    const res = await wpClient.get(`/posts/${id}`, {
      params: { _embed: 1 },
    });
    const post = res.data;
    return {
      id: post.id,
      title: stripHtml(post.title?.rendered || ""),
      content: post.content?.rendered || "",
      excerpt: stripHtml(post.excerpt?.rendered || ""),
      slug: post.slug,
      date: post.date,
      thumbnail:
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      category: post._embedded?.["wp:term"]?.[0]?.[0]?.name || null,
    };
  },

  /**
   * Gửi đặt phòng đến custom WP REST endpoint
   * (cần cài wordpress-plugin/mira-booking-api.php)
   */
  submitBooking: async (formData) => {
    const res = await axios.post(`${MIRA_API}/booking`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
};
