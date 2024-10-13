"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";

interface Appointment {
  id: string;
  report: string;
  timestamp: string;
}

const ReportDropdown = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [translatedReport, setTranslatedReport] = useState<string | null>(null); // Holds the translated report
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Japanese"); // Default language for translation
  const [isLoading, setIsLoading] = useState(false); // To handle loading state

  // Fetch the appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, "final_summary"));
      const appointmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        report: doc.data().report || "",
        timestamp: doc.data().timestamp || "",
      }));
      setAppointments(appointmentList);
    };

    fetchAppointments();
  }, []);

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selected = appointments.find((appointment) => appointment.id === selectedId);
    setSelectedReport(selectedId);
    setSelectedAppointment(selected || null);
    setTranslatedReport(null); // Reset translated report on new selection
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleTranslateClick = async () => {
    if (!selectedAppointment) return;
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: selectedAppointment.id,
          language: selectedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedReport(data.translated_report); // Set translated report
        alert("Translation completed successfully!");
      } else {
        console.error("Failed to translate:", response.statusText);
        alert("Failed to translate. Please try again.");
      }
    } catch (error) {
      console.error("Error translating report:", error);
      alert("Error translating report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatReport = (report: string) => {
    return report.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 shadow-md rounded-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Select a Previous Appointment
      </h2>

      <div className="mb-6">
        <select
          value={selectedReport}
          onChange={handleDropdownChange}
          className="w-full p-4 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select an appointment
          </option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {`Appointment - ${new Date(appointment.timestamp).toLocaleDateString()}`}
            </option>
          ))}
        </select>
      </div>

      {selectedAppointment && (
        <div className="p-6 bg-white border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Original Report</h3>
          <div
            dangerouslySetInnerHTML={{ __html: formatReport(selectedAppointment.report) }}
          ></div>
        </div>
      )}

      <div className="mt-6">
        <label className="block mb-2 text-gray-700">Select Language for Translation:</label>
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="w-full p-4 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Japanese">Japanese</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleTranslateClick}
          className="px-6 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600"
          disabled={isLoading || !selectedAppointment}
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>
      </div>

      {translatedReport && (
        <div className="mt-8 p-6 bg-white border rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Translated Report</h3>
          <p className="text-gray-700">{translatedReport}</p>
        </div>
      )}
    </div>
  );
};

export default ReportDropdown;
