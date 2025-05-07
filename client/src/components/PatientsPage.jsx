import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PatientSummaryModal from "../components/PatientSummaryModal";

const PatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [patients, setPatients] = useState([]);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  function make_upper_case(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    const getPatients = async () => {
      const access_token = localStorage.getItem("accessToken");
      const therapist_id = localStorage.getItem("therapist_id");
      console.log("therapist id:", therapist_id);

      if (!access_token) {
        console.error("No token found. Redirecting...");
        window.location.href = "/login";
      }

      /* This api calls the get_client() func */
      const api_url = "http://127.0.0.1:8000/api/fetchClients/";

      try {
        console.log("Access Token: ", access_token);
        const resp = await axios.get(api_url, {
          headers: {
            Authorization: `Bearer ${access_token.trim()}`, // Trim any spaces
            "Content-Type": "application/json",
          },
          params: { therapist_id: therapist_id },
        });
        localStorage.setItem("patient_id", resp.data.message.user_id);
        console.log("Response", resp.data.message);

        if (Array.isArray(resp.data.message)) {
          setPatients(resp.data.message);
        }
      } catch (e) {
        console.error("Axios Error:", e.response?.data || e.message);
      }
    };

    getPatients();
  }, []);

  const handleShowSummary = (patient) => {
    setSelectedPatient(patient);
    setSummaryModalOpen(true);
  };

  // Filter patients based on search term and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    //||patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex mt-3 flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {patient.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {make_upper_case(patient.gender)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {patient.lastVisit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {patient.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            patient.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {make_upper_case(patient.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/therapist/patients/${patient.id}`}
                          state={{
                            name: patient.name,
                            age: patient.age,
                            gender: patient.gender,
                            email: patient.email,
                            status: patient.status,
                            phone: patient.phone,
                            note: patient.notes,
                            appointment: patient.appointment,
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </Link>
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleShowSummary(patient)}
                        >
                          Summary
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No patients found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
      
      {summaryModalOpen && selectedPatient && (
        <PatientSummaryModal
          isOpen={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          patientId={selectedPatient.user_id}
          patientName={selectedPatient.name}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default PatientsPage;
