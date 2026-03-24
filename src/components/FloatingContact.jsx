import React, { useState } from "react";
import { Box, Text } from "zmp-ui";
import { handleCall, handleOpenChat } from "../utils/contact";

const PHONE = "02563822222";
const FB_PAGE = "https://m.me/mira.hotel.quynhon";

// SVG icons
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.01l-2.2 2.21z" fill="white"/>
  </svg>
);

const ZaloIcon = () => (
  <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="22" fill="white" fontWeight="bold">Z</text>
  </svg>
);

const MessengerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.688 7.2V22l3.37-1.85A10.7 10.7 0 0012 20.486c5.523 0 10-4.144 10-9.243C22 6.145 17.523 2 12 2zm1.008 12.435l-2.545-2.714-4.97 2.714 5.467-5.804 2.608 2.714 4.908-2.714-5.468 5.804z"/>
  </svg>
);

const buttons = [
  {
    label: "Gọi điện",
    gradient: "linear-gradient(135deg, #0EA5E9, #0369A1)",
    shadow: "rgba(14,165,233,0.45)",
    Icon: PhoneIcon,
    action: () => handleCall(PHONE),
  },
  {
    label: "Chat Zalo",
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    shadow: "rgba(59,130,246,0.45)",
    Icon: ZaloIcon,
    action: () => handleOpenChat(),
  },
  {
    label: "Messenger",
    gradient: "linear-gradient(135deg, #A855F7, #6D28D9)",
    shadow: "rgba(168,85,247,0.45)",
    Icon: MessengerIcon,
    action: () => window.open(FB_PAGE),
  },
];

const FloatingContact = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop blur khi mở */}
      {open && (
        <Box
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            zIndex: 9990,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <Box
        style={{
          position: "fixed",
          bottom: 80,
          right: 16,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        {/* Action buttons */}
        {buttons.map((btn, i) => (
          <Box
            key={btn.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              pointerEvents: "all",
              cursor: "pointer",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0) scale(1)" : `translateY(${(buttons.length - i) * 16}px) scale(0.7)`,
              transition: `opacity 0.22s ease ${i * 0.05}s, transform 0.22s ease ${i * 0.05}s`,
            }}
            onClick={() => {
              btn.action();
              setOpen(false);
            }}
          >
            {/* Label */}
            <Box
              style={{
                background: "rgba(15,20,35,0.78)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: 24,
                padding: "5px 14px",
                border: "0.5px solid rgba(255,255,255,0.12)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: 0.2 }}>
                {btn.label}
              </Text>
            </Box>

            {/* Icon circle */}
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: btn.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 16px ${btn.shadow}, 0 1px 4px rgba(0,0,0,0.2)`,
                flexShrink: 0,
                border: "1.5px solid rgba(255,255,255,0.20)",
              }}
            >
              <btn.Icon />
            </Box>
          </Box>
        ))}

        {/* Main FAB */}
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: open
              ? "linear-gradient(135deg, #EF4444, #DC2626)"
              : "linear-gradient(135deg, #D4A843, #C9A84C, #A8893A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: open
              ? "0 4px 20px rgba(239,68,68,0.55), 0 1px 6px rgba(0,0,0,0.25)"
              : "0 4px 20px rgba(201,168,76,0.55), 0 1px 6px rgba(0,0,0,0.25)",
            cursor: "pointer",
            pointerEvents: "all",
            border: "1.5px solid rgba(255,255,255,0.25)",
            transition: "all 0.25s ease",
          }}
          onClick={() => setOpen((v) => !v)}
        >
          <Box
            style={{
              transition: "transform 0.25s ease",
              transform: open ? "rotate(45deg)" : "rotate(0deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.01l-2.2 2.21z" fill="white"/>
              </svg>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default FloatingContact;
