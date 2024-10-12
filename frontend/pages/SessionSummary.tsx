"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

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
  const [editedData, setEditedData] = useState<VisitSummaryData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const documentId = "D2lKMHDmHctcr1WX9dkr"; // Replace with your Firestore document ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "meeting_summaries", documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as VisitSummaryData;
          console.log("Fetched Data:", data);

          setSummaryData(data);
          setEditedData(data); // Initialize editing mode with fetched data
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: keyof VisitSummaryData
  ) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: e.target.value });
    }
  };

  const handleBooleanChange = (field: keyof VisitSummaryData) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: !editedData[field] });
    }
  };

  const handleArrayChange = (
    index: number,
    value: string,
    field: keyof VisitSummaryData
  ) => {
    if (editedData && Array.isArray(editedData[field])) {
      const newArray = [...(editedData[field] as string[])];
      newArray[index] = value;
      setEditedData({ ...editedData, [field]: newArray });
    }
  };

  const handleSaveClick = async () => {
    if (!editedData) return;

    try {
      const docRef = doc(db, "meeting_summaries", documentId);
      await updateDoc(docRef, editedData);

      setSummaryData(editedData); // Update UI with saved data
      setIsEditing(false); // Exit edit mode
      alert("Summary updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update summary. Please try again.");
    }
  };

  if (!summaryData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Doctor Visit Summary
      </h2>

      {/** Doctor Notes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Doctor Notes</h3>
        {isEditing ? (
          <textarea
            className="w-full border p-2 mt-2"
            value={editedData?.doctor_notes || ""}
            onChange={(e) => handleChange(e, "doctor_notes")}
          />
        ) : (
          <p className="text-gray-700 mt-2">{summaryData.doctor_notes}</p>
        )}
      </div>

      {/** Patient Notes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Patient Notes</h3>
        {isEditing ? (
          <textarea
            className="w-full border p-2 mt-2"
            value={editedData?.patient_notes || ""}
            onChange={(e) => handleChange(e, "patient_notes")}
          />
        ) : (
          <p className="text-gray-700 mt-2">{summaryData.patient_notes}</p>
        )}
      </div>

      {/** Doctor's Diagnosis */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-blue-600">Doctor's Diagnosis</h3>
  {isEditing ? (
    (editedData?.doctor_diagnosis || []).map((diagnosis, index) => (
      <input
        key={index}
        className="w-full border p-2 mt-2"
        value={diagnosis || ""} // Ensure fallback value
        onChange={(e) =>
          handleArrayChange(index, e.target.value, "doctor_diagnosis")
        }
      />
    ))
  ) : (
    <ul className="list-disc list-inside text-gray-700 mt-2">
      {(summaryData?.doctor_diagnosis || []).map((diagnosis, index) => (
        <li key={index}>{diagnosis || "N/A"}</li> // Provide fallback value
      ))}
    </ul>
  )}
</div>


      {/** Meeting Minutes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Meeting Minutes</h3>
        {isEditing ? (
          <input
            type="number"
            className="w-full border p-2 mt-2"
            value={editedData?.meeting_minutes || 0}
            onChange={(e) => handleChange(e, "meeting_minutes")}
          />
        ) : (
          <p className="text-gray-700 mt-2">
            {summaryData.meeting_minutes} minutes
          </p>
        )}
      </div>

      {/** Follow-up Required */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Follow-up Required</h3>
        {isEditing ? (
          <input
            className="w-full border p-2 mt-2"
            value={editedData?.follow_up_required || ""}
            onChange={(e) => handleChange(e, "follow_up_required")}
          />
        ) : (
          <p className="text-gray-700 mt-2">
            {summaryData.follow_up_required === "yes"
              ? "Follow-up is required."
              : "No follow-up needed."}
          </p>
        )}
      </div>

      {/** Save and Edit Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={isEditing ? handleSaveClick : () => setIsEditing(true)}
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
