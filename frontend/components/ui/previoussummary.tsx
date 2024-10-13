"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebaseConfig";

interface Appointment {
  id: string;
  report: string;
  timestamp: string;
}

const ReportDropdown = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>(""); // Set the default state to an empty string
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch the appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, "final_summary"));
      const appointmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        report: doc.data().report || '', // The 'report' field from Firestore
        timestamp: doc.data().timestamp || '', // The 'timestamp' field from Firestore
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
  };

  // Function to replace ** with bold tags and handle line breaks
  const formatReport = (report: string) => {
    return report.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-100 to-blue-200 shadow-md rounded-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Select a Previous Appointment</h2>

      <div className="mb-6">
        <select
          value={selectedReport} // Value is an empty string initially
          onChange={handleDropdownChange}
          className="w-full p-4 border rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select an appointment
          </option>
          {/* Hardcoded names with Firestore document ID values */}
          {appointments.length > 0 && (
            <>
              <option value={appointments[0].id}>Dr. Smith - Appointment 10/24</option>
              <option value={appointments[1].id}>Dr. Smith - Appointment 09/24</option>
              <option value={appointments[2].id}>Dr. Smith - Appointment 08/24</option>
            </>
          )}
        </select>
      </div>

      {selectedAppointment && (
        <div
          className="p-6 bg-white border rounded-lg shadow-md"
          dangerouslySetInnerHTML={{ __html: formatReport(selectedAppointment.report) }} // Display formatted report
        ></div>
      )}

      {!selectedAppointment && (
        <p className="text-gray-500 text-center">Please select an appointment to view the report.</p>
      )}
    </div>
  );
};

export default ReportDropdown;
