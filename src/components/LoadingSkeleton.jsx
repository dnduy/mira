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

export default LoadingSkeleton;
