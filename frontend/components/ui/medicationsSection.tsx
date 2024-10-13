import React from 'react';

interface MedicationsSectionProps {
  medications: string[];
}

const MedicationsSection: React.FC<MedicationsSectionProps> = ({ medications }) => {
  return (
    <div style={{ backgroundColor: "#d5f5e3", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Medications</h3>
      <p>{medications.length > 0 ? medications.join(', ') : 'No known medications'}</p>
    </div>
  );
};

export default MedicationsSection;
