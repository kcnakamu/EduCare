import React from 'react';

interface LanguageSectionProps {
  languages: string[];
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ languages }) => {
  return (
    <div style={{ backgroundColor: "#d6eaf8", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Languages</h3>
      <p>{languages.length > 0 ? languages.join(', ') : 'No languages reported.'}</p>
    </div>
  );
};

export default LanguageSection;
