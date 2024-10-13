"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
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

interface FinalSummary {
  report: string;
  timestamp: string;
}

const VisitSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<VisitSummaryData | null>(null);
  const [parserData, setParserData] = useState<ParserOutput | null>(null);
  const [openAISummary, setOpenAISummary] = useState<OpenAISummary | null>(null);
  const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null); // Final summary state
  const [editedParserData, setEditedParserData] = useState<ParserOutput | null>(null);
  const [editedAISummary, setEditedAISummary] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const summaryDocumentId = "test_large";
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
        }

        if (parserSnap.exists()) {
          const parserData = parserSnap.data() as ParserOutput;
          setParserData(parserData);
          setEditedParserData(parserData);
        }

        if (openAISnap.exists()) {
          const openAISummary = openAISnap.data() as OpenAISummary;
          setOpenAISummary(openAISummary);
          setEditedAISummary(openAISummary.summary);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Real-time listener for final summary
    const finalSummaryRef = doc(db, "final_summary", openAIDocumentId);
    const unsubscribe = onSnapshot(finalSummaryRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FinalSummary;
        setFinalSummary(data);
      }
    });

    fetchData();
    return () => unsubscribe(); // Cleanup listener
  }, []);

  const handleAISummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedAISummary(e.target.value);
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
      const parserRef = doc(db, "parser_output", summaryDocumentId);
      const openAIRef = doc(db, "openai_summary_1", openAIDocumentId);

      if (editedParserData) {
        await updateDoc(parserRef, editedParserData);
        setParserData(editedParserData);
      }
      if (editedAISummary !== null) {
        await updateDoc(openAIRef, { summary: editedAISummary });
        setOpenAISummary({ summary: editedAISummary });
      }

      setIsEditing(false);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleApproveClick = async () => {
    try {
      const response = await fetch("http://localhost:5000/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary_id: openAIDocumentId,
          parser_id: summaryDocumentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Report generated:", data.report);
        alert("Summary approved and report generated successfully!");
      } else {
        console.error("Failed to generate report:", response.statusText);
        alert("Failed to generate report. Please try again.");
      }
    } catch (error) {
      console.error("Error approving summary:", error);
      alert("Failed to approve summary. Please try again.");
    }
  };

  const handleOpenFinalSummary = () => {
    if (finalSummary) {
      const newWindow = window.open("", "_blank");
      const formattedSummary = finalSummary.report
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Makes text between ** bold
        .replace(/\n/g, "<br>"); // Preserves newlines
  
        const summaryContent = `
      <html>
        <head>
          <title>Final Summary</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f0f8ff;
              padding: 20px;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              border-left: 6px solid #4a90e2;
            }
            h2 {
              color: #4a90e2;
              margin-bottom: 20px;
              font-size: 24px;
            }
            p {
              color: #7f8c8d;
              line-height: 1.6;
              margin-bottom: 20px;
              font-size: 16px;
            }
            .section {
              margin-bottom: 30px;
            }
            strong {
              font-weight: bold;
              color: #333;
            }
            .icon {
              width: 20px;
              vertical-align: middle;
              margin-right: 8px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-bottom: 10px;
              border-bottom: 2px solid #e0e0e0;
              margin-bottom: 20px;
            }
            .doctor-notes, .prescription, .advice {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 15px;
              border: 1px solid #d9d9d9;
            }
            .section-header {
              font-size: 18px;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
            }
            .timestamp {
              font-size: 14px;
              color: #7f8c8d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Doctor Visit Summary</h2>
              <p class="timestamp"><strong>Generated on:</strong> ${finalSummary.timestamp}</p>
            </div>
            
            <div class="section doctor-notes">
              <div class="section-header">
                Doctor's Notes
              </div>
              <p>${formattedSummary}</p>
            </div>

            <div class="section prescription">
              <div class="section-header">
                <img class="icon" src="https://img.icons8.com/ios-filled/50/000000/pill.png" alt="pill icon">
                Prescription
              </div>
              <p>No new prescriptions for this visit.</p>
            </div>

            <div class="section advice">
              <div class="section-header">
                <img class="icon" src="https://img.icons8.com/ios-filled/50/000000/stethoscope.png" alt="stethoscope icon">
                Additional Advice
              </div>
              <p>Follow-up in 2 weeks for a blood pressure check-up.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  
      newWindow?.document.write(summaryContent);
      newWindow?.document.close(); // Ensures the content gets written
    } else {
      alert("No final summary available.");
    }
  };
  

  const handleSendToPatient = () => {
    if (finalSummary) {
      console.log("Sending report to patient:", finalSummary.report);
      alert("Report sent to the patient!");
    } else {
      alert("No report available to send.");
    }
  };

  const formatKey = (key: string) =>
    key.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  if (isLoading) return <p className="text-center text-gray-500">Loading data...</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Doctor Visit Summary
      </h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-700">AI-Generated Summary</h3>
        {isEditing ? (
          <textarea
            className="w-full border p-3 mt-2 rounded"
            value={editedAISummary || ""}
            onChange={handleAISummaryChange}
          />
        ) : (
          <p className="text-gray-700 mt-2">{openAISummary?.summary}</p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-700">Extracted Information</h3>
        {Object.entries(parserData || {}).map(([key, values], index) => (
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

      <div className="flex justify-between mt-8">
        <button
          onClick={isEditing ? handleSaveClick : () => setIsEditing(true)}
          className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-lg font-semibold text-white"
        >
          {isEditing ? "Save Changes" : "Edit Information"}
        </button>
        <button
          onClick={handleApproveClick}
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold text-white"
        >
          Approve Summary
        </button>
        <button
          onClick={handleOpenFinalSummary}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold text-white"
        >
          View Final Summary
        </button>
        <button
          onClick={handleSendToPatient}
          className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg font-semibold text-white"
        >
          Send to Patient
        </button>
      </div>
    </div>
  );
};

export default VisitSummary;
