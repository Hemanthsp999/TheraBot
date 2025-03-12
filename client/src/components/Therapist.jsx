import { useState, useEffect, useMemo } from "react";
import axios from "axios";
// import Bot from "./images/Bot.jpeg";

// New BookingModal Component
const BookingModal = ({ therapist, isOpen, onClose }) => {
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    sessionType: "video",
    notes: "",
    therapist_id: therapist.id,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const api_url = "http://127.0.0.1:8000/api/therapist-members/";
    const access_token = localStorage.getItem("accessToken");
    try {
      const post_data = await axios.post(
        api_url,
        {
          therapist_id: bookingData.therapist_id,
          session_type: bookingData.sessionType,
          assign_date: bookingData.date,
          assign_time: bookingData.time,
          note: bookingData.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Data Posted: ", post_data.data.message);
      alert(post_data.data.message);
    } catch (error) {
      console.error("Booking failed: ", error.response?.data || error.message);
    }

    onClose();
  };

  useEffect(() => {
    if (therapist) {
      setBookingData((prevData) => ({
        ...prevData,
        therapist_id: therapist.id, // ✅ Update therapist_id when therapist changes
      }));
    }
  }, [therapist]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50"
        >
          <span className="text-white text-xl font-bold">×</span>
        </button>

        <h2 className="text-2xl font-bold text-black mb-4">
          Book Session with {therapist.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-black font-medium mb-1">Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              value={bookingData.date}
              onChange={(e) =>
                setBookingData({ ...bookingData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-black font-medium mb-1">Time</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              value={bookingData.time}
              onChange={(e) =>
                setBookingData({ ...bookingData, time: e.target.value })
              }
            >
              <option value="">Select a time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-black font-medium mb-1">
              Session Type
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              value={bookingData.sessionType}
              onChange={(e) =>
                setBookingData({ ...bookingData, sessionType: e.target.value })
              }
            >
              <option value="video">Video Call</option>
              <option value="audio">Audio Call</option>
              <option value="chat">Chat Session</option>
            </select>
          </div>

          <div>
            <label className="block text-black font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              rows="3"
              placeholder="Any specific concerns or topics you'd like to discuss..."
              value={bookingData.notes}
              onChange={(e) =>
                setBookingData({ ...bookingData, notes: e.target.value })
              }
            ></textarea>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Confirm Booking
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update TherapistCard to handle booking
const TherapistCard = ({ therapist }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative">
          <img
            src={therapist.image}
            alt={therapist.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold">
            ⭐ {therapist.rating}
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-semibold text-black mb-2">
            {therapist.name}
          </h3>
          <p className="text-black font-medium mb-2">
            {therapist.specialization}
          </p>
          <p className="text-black mb-2">Experience: {therapist.experience}</p>
          <p className="text-black mb-4">Available: {therapist.availability}</p>

          <div className="mb-4">
            <p className="text-black">{therapist.desc}</p>
          </div>

          <div className="mb-4">
            <p className="text-black font-medium text-center mb-2">Languages</p>
            <div className="flex justify-center gap-2">
              {/*{therapist.languages.map((language, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}*/}
            </div>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            onClick={() => setIsBookingModalOpen(true)}
          >
            Book Session
          </button>
        </div>
      </div>

      <BookingModal
        therapist={therapist}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </>
  );
};

const Therapist = () => {
  const [therapists, setTherapists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    const retrieve_therapists = async () => {
      const api = "http://127.0.0.1:8000/api/therapist-members/";
      const access_token = localStorage.getItem("accessToken");

      try {
        const response = await axios.get(api, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (Array.isArray(response.data.therapists)) {
          console.log(response.data.therapists);
          setTherapists(response.data.therapists);
        } else {
          console.error(
            "Expected an array but got: ",
            response.data.therapists,
          );
        }
      } catch (e) {
        console.error(e);
        setTherapists([]);
      }
    };

    retrieve_therapists();
  }, []);

  // Filter therapists based on search query and filters
  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      const matchesSearch =
        searchQuery === "" ||
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialization
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesSpecialization =
        specialization === "" ||
        therapist.specialization
          .toLowerCase()
          .includes(specialization.toLowerCase());

      {
        /*
      const matchesLanguage =
        language === "" ||
        therapist.languages.some(
          (lang) => lang.toLowerCase() === language.toLowerCase(),
        );
        */
      }

      return matchesSearch && matchesSpecialization; // && matchesLanguage;
    });
  }, [therapists, searchQuery, specialization, language]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">
          Our Professional Therapists
        </h1>
        <p className="text-black max-w-2xl mx-auto">
          Connect with licensed therapists who specialize in various areas of
          mental health. Book a session with a professional who best matches
          your needs.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search therapists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
            />
            {/* Search Suggestions */}
            {searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredTherapists.length > 0 ? (
                  filteredTherapists.map((therapist) => (
                    <div
                      key={therapist.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black text-left"
                      onClick={() => {
                        setSearchQuery(therapist.name);
                      }}
                    >
                      <div className="font-medium">{therapist.name}</div>
                      <div className="text-sm text-black">
                        {therapist.specialization}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-black text-left">
                    No therapists found
                  </div>
                )}
              </div>
            )}
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="" className="text-black">
              Specialization
            </option>
            <option value="anxiety" className="text-black">
              Anxiety & Depression
            </option>
            <option value="relationships" className="text-black">
              Relationship Counseling
            </option>
            <option value="trauma" className="text-black">
              Trauma & PTSD
            </option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="" className="text-black">
              Language
            </option>
            <option value="english" className="text-black">
              English
            </option>
            <option value="spanish" className="text-black">
              Spanish
            </option>
            <option value="mandarin" className="text-black">
              Mandarin
            </option>
          </select>
        </div>
      </div>

      {/* Therapists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTherapists.map((therapist) => (
          <TherapistCard key={therapist.id} therapist={therapist} />
        ))}
      </div>

      {/* No Results Message */}
      {filteredTherapists.length === 0 && (
        <div className="text-center py-8 text-black">
          No therapists found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default Therapist;
