import React from 'react';

interface AllergiesSectionProps {
  allergies: string[];
}

const AllergiesSection: React.FC<AllergiesSectionProps> = ({ allergies }) => {
  return (
    <div style={{ backgroundColor: "#f9ebea", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Allergies</h3>
      <p>{allergies.length > 0 ? allergies.join(', ') : 'No known allergies'}</p>
    </div>
  );
};

export default AllergiesSection;
