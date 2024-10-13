"use client";
import React, { useEffect, useState } from "react";
import PatientDemographics from "@/components/ui/patientDemographics";
import AllergiesSection from "@/components/ui/allergiesSection";
import MedicationsSection from "@/components/ui/medicationsSection";
import ActiveProblemsSection from "@/components/ui/activeProblemsSection";
import ImmunizationsSection from "@/components/ui/immunizationsSection";
import SocialHistorySection from "@/components/ui/socialHistorySection";
import VitalSignsSection from "@/components/ui/vitalSignsSection";
import LanguageSection from "@/components/ui/languageSection";

const fetchPatientData = async () => {
  return {
    id: 1,
    name: "Alex Johnson",
    gender: "Male",
    birthDate: "Feb. 15, 1985",
    address: "1234 Elm St, Springfield, IL 62704",
    contactInfo: {
      home: "555-123-4567",
      mobile: "555-987-6543",
      email: "alex.johnson@example.com",
    },
    allergies: ["Penicillin", "Dust"],
    medications: ["Lisinopril", "Metformin"],
    activeProblems: [{ problem: "Hypertension", diagnosedDate: "01/12/2018" }],
    immunizations: [
      { vaccine: "Covid-19 Vaccine Pfizer", dateGiven: "04/16/2021" },
      { vaccine: "Flu Shot", dateGiven: "09/15/2023" },
    ],
    socialHistory: {
      tobaccoUse: "Never",
      alcoholUse: "Occasional",
    },
    vitalSigns: {
      bloodPressure: "120/80",
      pulse: "72",
      weight: "75 kg",
      height: "175 cm",
      bodyMassIndex: "24.5",
    },
    languages: ["English", "Hindi", "Japanese"],
  };
};

const PatientSummary = () => {
  const [patient, setPatient] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchPatientData().then(setPatient);
  }, []);

  const startRecording = async () => {
    try {
      const response = await fetch("http://localhost:5000/start", { method: "POST" });
      if (response.ok) {
        setIsRecording(true);
        alert("Recording started...");
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Error starting the recording.");
    }
  };

  const stopRecording = async () => {
    try {
      const response = await fetch("http://localhost:5000/stop", { method: "POST" });
      if (response.ok) {
        setIsRecording(false);
        alert("Recording stopped and transcript saved successfully.");
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      alert("Error stopping the recording.");
    }
  };

  if (!patient) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", backgroundColor: "#f4f7f9", minHeight: "100vh" }}>
      <div
        style={{
          padding: "20px",
          maxWidth: "800px",
          margin: "auto",
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>Patient Health Summary</h2>
        <p style={{ color: "#7f8c8d" }}>Generated on Oct. 12, 2024</p>

        <PatientDemographics {...patient} />
        <AllergiesSection allergies={patient.allergies} />
        <MedicationsSection medications={patient.medications} />
        <ActiveProblemsSection activeProblems={patient.activeProblems} />
        <ImmunizationsSection immunizations={patient.immunizations} />
        <SocialHistorySection {...patient.socialHistory} />
        <VitalSignsSection vitalSigns={patient.vitalSigns} />
        <LanguageSection languages={patient.languages} />

        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: isRecording
                ? "linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 0, 0, 0.3))"
                : "linear-gradient(135deg, rgba(0, 204, 0, 0.7), rgba(0, 204, 0, 0.3))",
              border: "none",
              boxShadow: "0 4px 15px rgba(0, 204, 0, 0.5)",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            {isRecording ? "STOP" : "RECORD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
