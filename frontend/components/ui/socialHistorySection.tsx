import React from 'react';

interface SocialHistorySectionProps {
  tobaccoUse: string;
  alcoholUse: string;
}

const SocialHistorySection: React.FC<SocialHistorySectionProps> = ({ tobaccoUse, alcoholUse }) => {
  return (
    <div style={{ backgroundColor: "#f9e79f", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Social History</h3>
      <p>
        <strong>Tobacco Use:</strong> {tobaccoUse} <br />
        <strong>Alcohol Use:</strong> {alcoholUse}
      </p>
    </div>
  );
};

export default SocialHistorySection;
