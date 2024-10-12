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
  approved?: boolean; // Optional field to track approval status
}

interface ParserOutput {
  [key: string]: string[]; // Parser output as a dynamic key-value object
}

const VisitSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<VisitSummaryData | null>(null);
  const [parserData, setParserData] = useState<ParserOutput | null>(null);
  const [editedData, setEditedData] = useState<VisitSummaryData | null>(null);
  const [editedParserData, setEditedParserData] = useState<ParserOutput | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const documentId = "vMGc7EC72SrLODfpYs0i"; // Replace with your Firestore document ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "meeting_summaries", documentId);
        const parserRef = doc(db, "parser_output", documentId);

        const docSnap = await getDoc(docRef);
        const parserSnap = await getDoc(parserRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as VisitSummaryData;
          setSummaryData(data);
          setEditedData(data); // Initialize with fetched data
        } else {
          console.error("No summary data found!");
        }

        if (parserSnap.exists()) {
          const parserData = parserSnap.data() as ParserOutput;
          setParserData(parserData);
          setEditedParserData(parserData); // Initialize with fetched parser data
        } else {
          console.error("No parser data found!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleParserChange = (key: string, index: number, value: string) => {
    if (editedParserData) {
      const newArray = [...(editedParserData[key] || [])];
      newArray[index] = value;
      setEditedParserData({ ...editedParserData, [key]: newArray });
    }
  };

  const handleSaveClick = async () => {
    try {
      const summaryRef = doc(db, "meeting_summaries", documentId);
      const parserRef = doc(db, "parser_output", documentId);

      if (editedData) await updateDoc(summaryRef, editedData);
      if (editedParserData) await updateDoc(parserRef, editedParserData);

      setSummaryData(editedData); // Update UI with saved data
      setParserData(editedParserData); // Update UI with saved parser data
      setIsEditing(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data. Please try again.");
    }
  };

  const handleApproveClick = async () => {
    try {
      const summaryRef = doc(db, "meeting_summaries", documentId);
      await updateDoc(summaryRef, { approved: true });

      setSummaryData((prev) => ({ ...prev!, approved: true }));
      alert("Summary approved successfully!");
    } catch (error) {
      console.error("Error approving summary:", error);
      alert("Failed to approve summary. Please try again.");
    }
  };

  if (!summaryData || !parserData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Doctor Visit Summary
      </h2>

      {/* Doctor Notes */}
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

      {/* Parser Output */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-600">Parser Output</h3>
        {Object.entries(parserData).map(([key, values], index) => (
          <div key={index} className="mb-4">
            <h4 className="font-semibold text-gray-600">{key}</h4>
            {isEditing ? (
              values.map((value, i) => (
                <input
                  key={i}
                  className="w-full border p-2 mt-2"
                  value={value}
                  onChange={(e) => handleParserChange(key, i, e.target.value)}
                />
              ))
            ) : (
              <ul className="list-disc list-inside text-gray-700">
                {values.map((value, i) => (
                  <li key={i}>{value}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Save, Edit, and Approve Buttons */}
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
          onClick={handleApproveClick}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default VisitSummary;
