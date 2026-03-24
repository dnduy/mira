import React from "react";
import { Box } from "zmp-ui";

const SkeletonBox = ({ width = "100%", height = 16, style = {} }) => (
  <Box
    style={{
      width,
      height,
      borderRadius: 6,
      background: "linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      ...style,
    }}
  />
);

// Skeleton cho danh sách khách sạn (HotelCard)
const LoadingSkeleton = ({ count = 3 }) => (
  <>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        style={{
          background: "#fff",
          borderRadius: 12,
          marginBottom: 10,
          overflow: "hidden",
          border: "0.5px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Card header skeleton */}
        <Box
          style={{
            background: "#1e2e41",
            padding: "14px 14px 16px",
          }}
        >
          <Box style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <SkeletonBox width={28} height={28} style={{ borderRadius: "50%", background: "#ffffff22" }} />
            <SkeletonBox width="55%" height={14} style={{ background: "#ffffff22" }} />
          </Box>
          <SkeletonBox width="30%" height={18} style={{ background: "#ffffff22", borderRadius: 20 }} />
        </Box>
        {/* Card footer skeleton */}
        <Box style={{ padding: "10px 14px 12px", display: "flex", justifyContent: "space-between" }}>
          <Box style={{ flex: 1 }}>
            <SkeletonBox width="70%" height={12} style={{ marginBottom: 6 }} />
            <SkeletonBox width="50%" height={11} />
          </Box>
          <SkeletonBox width={44} height={12} />
        </Box>
      </Box>
    ))}
  </>
);

// Skeleton cho trang Hotel Detail
export const HotelDetailSkeleton = () => (
  <>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    {/* Hero ảnh */}
    <SkeletonBox height={240} style={{ borderRadius: 0 }} />

    {/* Location strip */}
    <Box style={{ background: "#F5F0E8", padding: "10px 16px", display: "flex", gap: 10 }}>
      <SkeletonBox width="60%" height={13} />
      <SkeletonBox width="30%" height={13} />
    </Box>

    {/* Gallery strip */}
    <Box style={{ display: "flex", gap: 6, padding: "10px 16px", overflow: "hidden" }}>
      {[1, 2, 3].map((i) => (
        <SkeletonBox key={i} width={100} height={70} style={{ borderRadius: 8, flexShrink: 0 }} />
      ))}
    </Box>

    <Box style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Giới thiệu */}
      <Box style={{ background: "#fff", borderRadius: 12, padding: 14, border: "0.5px solid rgba(0,0,0,0.06)" }}>
        <SkeletonBox width="40%" height={14} style={{ marginBottom: 12 }} />
        <SkeletonBox height={12} style={{ marginBottom: 6 }} />
        <SkeletonBox height={12} style={{ marginBottom: 6 }} />
        <SkeletonBox width="80%" height={12} />
      </Box>
      {/* Giá */}
      <Box style={{ background: "#fff", borderRadius: 12, padding: 14, border: "0.5px solid rgba(0,0,0,0.06)" }}>
        <SkeletonBox width="35%" height={14} style={{ marginBottom: 12 }} />
        <SkeletonBox width="55%" height={28} style={{ marginBottom: 6 }} />
        <SkeletonBox width="45%" height={11} />
      </Box>
      {/* Tiện ích */}
      <Box style={{ background: "#fff", borderRadius: 12, padding: 14, border: "0.5px solid rgba(0,0,0,0.06)" }}>
        <SkeletonBox width="40%" height={14} style={{ marginBottom: 12 }} />
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[1,2,3,4,5,6].map((i) => <SkeletonBox key={i} height={12} />)}
        </Box>
      </Box>
    </Box>
  </>
);

export default LoadingSkeleton;
