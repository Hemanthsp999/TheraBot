import {Link} from "react-router-dom";
const Service = () => {
  return (
    <div className="bg-gray-100 min-h-screen mt-20 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-16 px-6 bg-blue-500 text-white">
        <h1 className="text-4xl font-bold">
          Your AI Mental Health Companion, Backed by Experts
        </h1>
        <p className="mt-4 text-lg">
          TheraBot provides AI-powered mental health support & connects you with
          certified therapists.
        </p>
        <div className="mt-6">
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
                        <Link to={'/chatbot'}>
            Try TheraBot Now
            </Link>
          </button>
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
                        <Link to={'/therapist'}>
            Meet Our Therapists
            </Link>
          </button>
        </div>
      </section>

            {/*
      <section className="text-center py-16 px-6 bg-gray-300 text-black">
        <h1 className="text-4xl font-bold">
          Your AI Mental Health Companion, Backed by Experts
        </h1>
        <p className="mt-4 text-lg">
          TheraBot provides AI-powered mental health support & connects you with
          certified therapists.
        </p>
        <div className="mt-6">
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
            Try TheraBot Now
          </button>
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
            Meet Our Therapists
          </button>
        </div>
      </section>
      */}

      {/* How TheraBot Helps */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center">How TheraBot Helps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: "Stress & Anxiety Support",
              desc: "Provides evidence-based coping strategies",
            },
            {
              title: "24/7 Chat Support",
              desc: "Always available to listen and guide",
            },
            {
              title: "Personalized Insights",
              desc: "Understands emotions through advanced NLP",
            },
            {
              title: "CBT Tips",
              desc: "Suggests practical exercises for mental well-being",
            },
            {
              title: "Mood Tracking",
              desc: "Helps users analyze their mental health trends",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center shadow-sm hover:shadow-md transition shadow-lg transition-colors duration-100 tansform hover:shadow-xl hover:scale-100"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-600 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Therapists */}
      <section className="py-16 px-6 bg-gray-200">
        <h2 className="text-3xl font-bold text-center">
          Meet Our Certified Therapists
        </h2>
        <p className="text-center text-gray-700 mt-2">
          Trusted experts ready to help you on your journey to better mental
          health.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              name: "Dr. Sarah Lee",
              expertise: "CBT & Anxiety Specialist",
              img: "https://via.placeholder.com/150",
            },
            {
              name: "Dr. Rahul Verma",
              expertise: "Depression & Stress Management",
              img: "https://via.placeholder.com/150",
            },
            {
              name: "Dr. Emily Carter",
              expertise: "Mindfulness & Trauma Therapy",
              img: "https://via.placeholder.com/150",
            },
          ].map((therapist, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center shadow-sm hover:shadow-md transition shadow-lg transition-colors duration-100 tansform hover:shadow-xl hover:scale-105"
            >
              <img
                src={therapist.img}
                alt={therapist.name}
                className="rounded-full mx-auto mb-4 w-24 h-24"
              />
              <h3 className="text-xl font-semibold">{therapist.name}</h3>
              <p className="text-gray-600">{therapist.expertise}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[
            {
              text: "TheraBot has been a lifesaver during my tough times.",
              user: "Aarav, 24",
            },
            {
              text: "Speaking to a real therapist was seamless and effective!",
              user: "Sanya, 30",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">"{testimonial.text}"</p>
              <p className="text-gray-500 mt-2 font-semibold">
                - {testimonial.user}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 mb-20 px-6 bg-blue-500 text-white">
        <h2 className="text-3xl font-bold">
          Ready to start your journey to better mental health?
        </h2>
        <div className="mt-6">
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
            Try TheraBot Now
          </button>
          <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold mx-2">
            Book a Session
          </button>
        </div>
      </section>
    </div>
  );
};

export default Service;
