import React from 'react';

interface VitalSigns {
  bloodPressure: string;
  pulse: string;
  weight: string;
  height: string;
  bodyMassIndex: string;
}

interface VitalSignsSectionProps {
  vitalSigns: VitalSigns;
}

const VitalSignsSection: React.FC<VitalSignsSectionProps> = ({ vitalSigns }) => {
  return (
    <div style={{ backgroundColor: "#d5dbdb", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Vital Signs</h3>
      <p>
        <strong>Blood Pressure:</strong> {vitalSigns.bloodPressure} <br />
        <strong>Pulse:</strong> {vitalSigns.pulse} <br />
        <strong>Weight:</strong> {vitalSigns.weight} <br />
        <strong>Height:</strong> {vitalSigns.height} <br />
        <strong>Body Mass Index:</strong> {vitalSigns.bodyMassIndex}
      </p>
    </div>
  );
};

export default VitalSignsSection;
