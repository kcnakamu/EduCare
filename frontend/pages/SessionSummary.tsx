"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig"; // Import Firestore config

// Adjusted interface to reflect Firestore data structure
interface VisitSummaryData {
  doctor_notes: string;
  patient_notes: string;
  concise_summary: string;
  doctor_diagnosis: string[];
  follow_up_required: string;
  prescription_given: boolean;
  meeting_minutes: number;
  timestamp: string;
  patient_concerns: string[];
}

const VisitSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<VisitSummaryData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch Firestore data on component load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "meeting_summaries", "D2lKMHDmHctcr1WX9dkr"); // Use your document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as VisitSummaryData;
          console.log("Fetched Data:", data); // Debugging log

          // Provide fallback values for missing fields
          setSummaryData({
            doctor_notes: data.doctor_notes || "",
            patient_notes: data.patient_notes || "",
            concise_summary: data.concise_summary || "",
            doctor_diagnosis: data.doctor_diagnosis || [],
            follow_up_required: data.follow_up_required || "no",
            prescription_given: data.prescription_given || false,
            meeting_minutes: data.meeting_minutes || 0,
            timestamp: data.timestamp || "",
            patient_concerns: data.patient_concerns || [],
          });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, []);

  if (!summaryData) {
    return <p>Loading...</p>; // Show loading state
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Doctor Visit Summary
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Doctor Notes</h3>
        <p className="text-gray-700 mt-2">{summaryData.doctor_notes}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Patient Notes</h3>
        <p className="text-gray-700 mt-2">
          {summaryData.patient_notes || "No patient notes available."}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Concise Summary</h3>
        <p className="text-gray-700 mt-2">{summaryData.concise_summary}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">
          Doctor's Diagnosis
        </h3>
        <ul className="list-disc list-inside text-gray-700 mt-2">
          {(summaryData.doctor_diagnosis || []).map((diagnosis, index) => (
            <li key={index}>{diagnosis}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Follow-up Required</h3>
        <p className="text-gray-700 mt-2">
          {summaryData.follow_up_required === "yes"
            ? "Follow-up is required."
            : "No follow-up needed."}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">
          Prescription Given
        </h3>
        <p className="text-gray-700 mt-2">
          {summaryData.prescription_given ? "Yes" : "No"}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">
          Meeting Minutes
        </h3>
        <p className="text-gray-700 mt-2">{summaryData.meeting_minutes} minutes</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Patient Concerns</h3>
        {summaryData.patient_concerns.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {summaryData.patient_concerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 mt-2">No patient concerns recorded.</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Timestamp</h3>
        <p className="text-gray-700 mt-2">{summaryData.timestamp}</p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded text-white ${
            isEditing ? "bg-blue-500 hover:bg-blue-600" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isEditing ? "Save" : "Edit"}
        </button>
        <button
          onClick={() => alert("Summary Approved")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default VisitSummary;
