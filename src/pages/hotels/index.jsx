import React, { useEffect, useState } from "react";
import { Page, Box, Text, Button } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store";
import HotelCard from "../../components/HotelCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";

const FILTERS = ["Tất cả", "Gần biển nhất", "3 Sao", "Homestay", "Giá tốt"];

const HotelsPage = () => {
  const navigate = useNavigate();
  const { hotels, hotelsLoading, hotelsError, fetchHotels } = useAppStore();
  const [activeFilter, setActiveFilter] = useState("Tất cả");

  useEffect(() => {
    if (hotels.length === 0) fetchHotels();
  }, []);

  const filtered =
    activeFilter === "Tất cả"
      ? hotels
      : hotels.filter((h) => h.tag === activeFilter);

  return (
    <Page>
      {/* Header */}
      <Box
        style={{
          background: "linear-gradient(135deg, #1A2535, #1D4E6B)",
          padding: "20px 16px 28px",
        }}
      >
        <Text style={{ color: "#C9A84C", fontSize: 13, marginBottom: 4 }}>
          Hệ thống
        </Text>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          7 Khách sạn Mira
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          Tất cả cách biển ≤ 200m · Quy Nhơn
        </Text>
      </Box>

      {/* Filter chips */}
      <Box
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px 4px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              flexShrink: 0,
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 12,
              border: "1.5px solid",
              borderColor: activeFilter === f ? "#C9A84C" : "#e0e0e0",
              background: activeFilter === f ? "#C9A84C" : "#fff",
              color: activeFilter === f ? "#fff" : "#555",
              fontWeight: activeFilter === f ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </Box>

      {/* List */}
      <Box style={{ padding: "12px 16px" }}>
        {hotelsLoading && <LoadingSkeleton count={4} />}

        {hotelsError && (
          <Box
            style={{
              background: "#fff3f3",
              border: "1px solid #f5c6c6",
              borderRadius: 10,
              padding: 16,
              textAlign: "center",
            }}
          >
            <Text style={{ color: "#c0392b", marginBottom: 8 }}>
              Không tải được dữ liệu.
            </Text>
            <Button size="small" onClick={fetchHotels}>
              Thử lại
            </Button>
          </Box>
        )}

        {!hotelsLoading && filtered.length === 0 && !hotelsError && (
          <Box style={{ textAlign: "center", padding: "32px 0" }}>
            <Text style={{ color: "#7F8C8D", fontSize: 14 }}>
              Không có khách sạn phù hợp.
            </Text>
          </Box>
        )}

        {!hotelsLoading &&
          filtered.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onClick={() => navigate(`/hotel/${hotel.id}`)}
            />
          ))}
      </Box>
    </Page>
  );
};

export default HotelsPage;
