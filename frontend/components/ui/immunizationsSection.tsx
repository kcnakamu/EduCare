import React from 'react';

interface Immunization {
  vaccine: string;
  dateGiven: string;
}

interface ImmunizationsSectionProps {
  immunizations: Immunization[];
}

const ImmunizationsSection: React.FC<ImmunizationsSectionProps> = ({ immunizations }) => {
  return (
    <div style={{ backgroundColor: "#f2f3f4", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Immunizations</h3>
      {immunizations.length > 0 ? (
        immunizations.map((immunization, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{immunization.vaccine}</strong> (Given on {immunization.dateGiven})
          </div>
        ))
      ) : (
        <p>No immunizations reported.</p>
      )}
    </div>
  );
};

export default ImmunizationsSection;
