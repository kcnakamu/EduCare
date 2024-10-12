"use client"
import React, { useState } from "react";

interface VisitSummaryData {
  visitSummary: string;
  instructions: string;
  nextSteps: string;
  commonSymptoms: string[];
}

const VisitSummary: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [summaryData, setSummaryData] = useState<VisitSummaryData>({
    visitSummary:
      "CPT Code 99213: Office visit for evaluation and management of a patient with mild headaches. No major concerns found during physical exam.",
    instructions:
      "Prescriptions: 500mg Ibuprofen for pain relief. Instructions: Drink 8 glasses of water per day, take medication as prescribed.",
    nextSteps:
      "Monitor symptoms for two weeks. Follow up with the doctor if conditions worsen.",
    commonSymptoms: ["Severe headaches", "Nausea", "Dizziness", "Fever"],
  });

  const [editedData, setEditedData] = useState<VisitSummaryData>(summaryData);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setSummaryData(editedData); // Save the edited data
    setIsEditing(false);
  };

  const handleApproveClick = () => {
    alert("Summary Approved");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: keyof VisitSummaryData
  ) => {
    if (field === "commonSymptoms") {
      setEditedData({
        ...editedData,
        [field]: e.target.value.split("\n"), // Split by new lines
      });
    } else {
      setEditedData({ ...editedData, [field]: e.target.value });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        Doctor Visit Summary (CPT: 99213)
      </h2>

      <div className="flex justify-end space-x-4 mb-6">
        {isEditing ? (
          <button
            onClick={handleSaveClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save
          </button>
        ) : (
          <button
            onClick={handleEditClick}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleApproveClick}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Approve
        </button>
      </div>

      {/* Render the summary in editable or read-only mode */}
      {isEditing ? (
        <div>
          {/* Editable fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Visit Summary
            </h3>
            <textarea
              className="w-full border p-2 mt-2"
              value={editedData.visitSummary}
              onChange={(e) => handleChange(e, "visitSummary")}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Instructions / Prescription
            </h3>
            <textarea
              className="w-full border p-2 mt-2"
              value={editedData.instructions}
              onChange={(e) => handleChange(e, "instructions")}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">Next Steps</h3>
            <textarea
              className="w-full border p-2 mt-2"
              value={editedData.nextSteps}
              onChange={(e) => handleChange(e, "nextSteps")}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Common Symptoms to Watch For
            </h3>
            <textarea
              className="w-full border p-2 mt-2"
              value={editedData.commonSymptoms.join("\n")} // Join array into a single string
              onChange={(e) => handleChange(e, "commonSymptoms")}
            />
          </div>
        </div>
      ) : (
        <div>
          {/* Read-only fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Visit Summary
            </h3>
            <p className="text-gray-700 mt-2">{summaryData.visitSummary}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Instructions / Prescription
            </h3>
            <p className="text-gray-700 mt-2">{summaryData.instructions}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">Next Steps</h3>
            <p className="text-gray-700 mt-2">{summaryData.nextSteps}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-600">
              Common Symptoms to Watch For
            </h3>
            <ul className="list-disc list-inside text-gray-700 mt-2">
              {summaryData.commonSymptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitSummary;
