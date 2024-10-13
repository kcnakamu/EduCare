import React from 'react';

interface ContactInfo {
  home: string;
  mobile?: string;
  email: string;
}

interface PatientDemographicsProps {
  name: string;
  gender: string;
  birthDate: string;
  address: string;
  contactInfo: ContactInfo;
}

const PatientDemographics: React.FC<PatientDemographicsProps> = ({ name, gender, birthDate, address, contactInfo }) => {
  return (
    <div style={{ backgroundColor: "#e9f7fd", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
      <h3 style={{ color: "#2980b9" }}>Patient Demographics</h3>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Gender:</strong> {gender}</p>
      <p><strong>Date of Birth:</strong> {birthDate}</p>
      <p><strong>Address:</strong> {address}</p>
      
      <h4 style={{ marginTop: "15px", marginBottom: "5px", color: "#34495e" }}>Contact Information</h4>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p style={{ margin: "5px 0" }}><strong>Home:</strong> {contactInfo.home}</p>
        {contactInfo.mobile && <p style={{ margin: "5px 0" }}><strong>Mobile:</strong> {contactInfo.mobile}</p>}
        <p style={{ margin: "5px 0" }}><strong>Email:</strong> {contactInfo.email}</p>
      </div>
    </div>
  );
};

export default PatientDemographics;
