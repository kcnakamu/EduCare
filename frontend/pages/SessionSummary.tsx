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
  approved?: boolean;
}

interface ParserOutput {
  [key: string]: string[];
}

interface OpenAISummary {
  summary: string;
}

const VisitSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<VisitSummaryData | null>(null);
  const [parserData, setParserData] = useState<ParserOutput | null>(null);
  const [openAISummary, setOpenAISummary] = useState<OpenAISummary | null>(null);
  const [editedData, setEditedData] = useState<VisitSummaryData | null>(null);
  const [editedParserData, setEditedParserData] = useState<ParserOutput | null>(null);
  const [editedAISummary, setEditedAISummary] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const summaryDocumentId = "vMGc7EC72SrLODfpYs0i"; 
  const openAIDocumentId = "test_large"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "meeting_summaries", summaryDocumentId);
        const parserRef = doc(db, "parser_output", summaryDocumentId);
        const openAIRef = doc(db, "openai_summary_1", openAIDocumentId);

        const [docSnap, parserSnap, openAISnap] = await Promise.all([
          getDoc(docRef),
          getDoc(parserRef),
          getDoc(openAIRef),
        ]);

        if (docSnap.exists()) {
          const data = docSnap.data() as VisitSummaryData;
          setSummaryData(data);
          setEditedData(data);
        } else {
          console.error("No summary data found!");
        }

        if (parserSnap.exists()) {
          const parserData = parserSnap.data() as ParserOutput;
          setParserData(parserData);
          setEditedParserData(parserData);
        } else {
          console.error("No parser data found!");
        }

        if (openAISnap.exists()) {
          const openAISummary = openAISnap.data() as OpenAISummary;
          setOpenAISummary(openAISummary);
          setEditedAISummary(openAISummary.summary); // Initialize for editing
        } else {
          console.error("No OpenAI summary found!");
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

  const handleAISummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedAISummary(e.target.value);
  };

  const handleSaveClick = async () => {
    try {
      const summaryRef = doc(db, "meeting_summaries", summaryDocumentId);
      const parserRef = doc(db, "parser_output", summaryDocumentId);
      const openAIRef = doc(db, "openai_summary_1", openAIDocumentId);

      if (editedData) await updateDoc(summaryRef, editedData);
      if (editedParserData) await updateDoc(parserRef, editedParserData);
      if (editedAISummary !== null) await updateDoc(openAIRef, { summary: editedAISummary });

      setSummaryData(editedData);
      setParserData(editedParserData);
      setOpenAISummary({ summary: editedAISummary });
      setIsEditing(false);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleApproveClick = async () => {
    try {
      const summaryRef = doc(db, "meeting_summaries", summaryDocumentId);
      await updateDoc(summaryRef, { approved: true });

      setSummaryData((prev) => ({ ...prev!, approved: true }));
      alert("Summary approved successfully!");
    } catch (error) {
      console.error("Error approving summary:", error);
      alert("Failed to approve summary. Please try again.");
    }
  };

  const formatKey = (key: string) =>
    key
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (!summaryData || !parserData || !openAISummary) {
    return <p className="text-center text-gray-500">Loading data, please wait...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Doctor Visit Summary
      </h2>

      {/* AI-Generated Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-700">AI-Generated Summary</h3>
        {isEditing ? (
          <textarea
            className="w-full border p-3 mt-2 rounded"
            value={editedAISummary || ""}
            onChange={handleAISummaryChange}
          />
        ) : (
          <p className="text-gray-700 mt-2">{openAISummary.summary}</p>
        )}
      </div>

      {/* Parser Output */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-700">Extracted Information</h3>
        {Object.entries(parserData).map(([key, values], index) => (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-medium text-gray-800">{formatKey(key)}</h4>
            {isEditing ? (
              values.map((value, i) => (
                <input
                  key={i}
                  className="w-full border p-2 mt-2 rounded"
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
      <div className="flex justify-between mt-8">
        <button
          onClick={isEditing ? handleSaveClick : () => setIsEditing(true)}
          className={`px-6 py-2 rounded-lg font-semibold text-white ${
            isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isEditing ? "Save Changes" : "Edit Information"}
        </button>
        <button
          onClick={handleApproveClick}
          className="px-6 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600"
        >
          Approve Summary
        </button>
      </div>
    </div>
  );
};

export default VisitSummary;
