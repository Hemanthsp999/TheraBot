import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PatientDetailPage = () => {
  //const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const { id } = useParams();
  const location = useLocation();
  const { name, age, gender, status, appointment, email, phone, note } =
    location.state;

  // Mock patient data (would come from API in a real implementation)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatient({
        id: parseInt(id),
        name: "John Doe",
        age: 32,
        gender: "Male",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        address: "123 Main St, Anytown, USA",
        lastVisit: "2023-11-15",
        nextAppointment: "2023-12-05",
        condition: "Anxiety",
        status: "Active",
        notes:
          "Patient has been showing improvement with current therapy approach.",
        therapyHistory: [
          {
            date: "2023-11-15",
            type: "CBT Session",
            notes: "Discussed anxiety triggers and coping mechanisms.",
          },
          {
            date: "2023-11-01",
            type: "Initial Assessment",
            notes: "Patient reported anxiety symptoms for past 6 months.",
          },
          {
            date: "2023-10-15",
            type: "CBT Session",
            notes: "Introduced mindfulness techniques.",
          },
        ],
        medications: [
          {
            name: "Sertraline",
            dosage: "50mg",
            frequency: "Daily",
            startDate: "2023-10-01",
          },
        ],
      });
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Patient not found
        </div>
        <Link
          to="/therapist/patients"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <Link
            to="/therapist/patients"
            className="text-blue-500 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Patients
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                <p className="text-gray-600">
                  {age} years old, {gender}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    status === "True"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {patient.status}
                </span>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "therapy"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("therapy")}
                >
                  Therapy History
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "medications"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("medications")}
                >
                  Medications
                </button>
              </nav>
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Contact Information
                  </h2>
                  <div className="bg-gray-100 text-black p-4 rounded-md">
                    <p className="mb-2">
                      <span className="font-medium">Email:</span> {email}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Phone:</span> {phone}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {patient.address}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Appointment Information
                  </h2>
                  <div className="bg-gray-100 text-black p-4 rounded-md">
                    <p className="mb-2">
                      <span className="font-medium">Last Visit:</span>{" "}
                      {patient.lastVisit}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Next Appointment:</span>{" "}
                      {appointment}
                    </p>
                    <p>
                      <span className="font-medium">Condition:</span>{" "}
                      {patient.condition}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Notes
                  </h2>
                  <div className="bg-gray-100 text-black p-4 rounded-md">
                    <p>{note}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "therapy" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Therapy Sessions
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patient.therapyHistory.map((session, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {session.notes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "medications" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Current Medications
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patient.medications.map((medication, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medication.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medication.dosage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medication.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {medication.startDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300">
            Edit Patient
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300">
            Delete Patient
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PatientDetailPage;
