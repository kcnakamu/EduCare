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
import { MultiStepLoader } from "@/components/ui/multi-step-loader"; // Import the multi-step-loader component
import { RecordBackground } from "@/components/ui/recordBackground";
const loadingStates = [
  { text: "Connecting to out genius model..." },
  { text: "Processing your appointment details..." },
  { text: "Validating your converstaion for clarity..." },
  { text: "Creating a trusted summary for records... " },
  { text: "Using ICD codes to have a trusted diagnosis..." },
  { text: "Just a moment while we compile your notes..." },
  { text: "Loading your appointment summary for review..." },
];

// Modal Component
const Modal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  if (!isVisible) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button style={modalStyles.closeButton} onClick={onClose}>
          X
        </button>
        <div className="flex flex-col">
          <h3 style={{ marginBottom: '20px' }}>Recording in Progress...</h3>

         {/* Record Background Waves Below */}
         <div style={{ position: "relative", height: "150px", width: "100%", overflow: "hidden" }}>
            <RecordBackground waveWidth={50} backgroundFill="transparent" blur={10} waveOpacity={0.5} />
          </div>

          {/* Red Circular Button with Stop Text */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <button
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 0, 0, 0.3))",
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
              onClick={onClose} // Stop recording on click
            >
              Stop
            </button>
          </div>
          <p>Click "Stop" to end the recording.</p>
        </div>
      </div>
    </div>
  );
};


const modalStyles = {
  overlay: {
    position: "fixed" as "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    position: "relative" as "relative",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center" as "center",
  },
  closeButton: {
    position: "absolute" as "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};

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
  const [isModalVisible, setModalVisible] = useState(false); // For modal visibility
  const [loading, setLoading] = useState(false); // For loader
  const [currentState, setCurrentState] = useState(0); // Track current state of the loader

  useEffect(() => {
    fetchPatientData().then(setPatient);
  }, []);

  // UseEffect to handle the redirection after the loader finishes
  useEffect(() => {
    if (loading) {
      if (currentState >= loadingStates.length - 1) {
        setTimeout(() => {
          setLoading(false);
          window.location.href = "/summary"; // Redirect after loader finishes
        }, 2000); // Small delay to allow the last state to complete
      } else {
        const timeout = setTimeout(() => {
          setCurrentState((prev) => prev + 1);
        }, 2000); // Update the state every 2 seconds (duration)
        return () => clearTimeout(timeout);
      }
    }
  }, [loading, currentState]);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModalAndStartLoader = () => {
    setModalVisible(false);
    setLoading(true); // Start the loader when modal closes
  };

  if (!patient) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f4f7f9", minHeight: "100vh", minWidth: "130vh"  }}>
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

        {/* Circular Button with Greenish Wave Color */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(0, 204, 0, 0.7), rgba(0, 204, 0, 0.3))",
              border: "none",
              boxShadow: "0 4px 15px rgba(0, 204, 0, 0.5)",
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
            onClick={openModal} // Open modal on click
          >
            <span className="text-black">RECORD!</span>
          </button>
        </div>

        {/* Modal */}
        <Modal isVisible={isModalVisible} onClose={closeModalAndStartLoader} />

        {/* Multi-step Loader */}
        <MultiStepLoader
          loadingStates={loadingStates}
          loading={loading}
          duration={2000} // Step duration in milliseconds
          loop={false} // Disable looping to prevent restarting
        />
      </div>
    </div>
  );
};

export default PatientSummary;
