// components/RecordingPopup.tsx
"use client";
import React from "react";

const RecordingPopup = ({ onStop }: { onStop: () => void }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Transparent overlay
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#2c3e50" }}>Recording in progress...</h3>
        <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>Click stop to end the recording.</p>
        <button
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 0, 0, 0.3))", // Red gradient for stop recording
            border: "none",
            boxShadow: "0 4px 15px rgba(255, 0, 0, 0.5)",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={onStop}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default RecordingPopup;
