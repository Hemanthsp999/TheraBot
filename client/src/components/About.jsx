import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const reviews = [
  { 
    name: "Sarah J.", 
    role: "Patient", 
    text: "TheraBot helped me feel heard during my most anxious nights. Truly a safe space.", 
    bg: "bg-blue-50" 
  },
  { 
    name: "Dr. Aris Thorne", 
    role: "Clinical Psychologist", 
    text: "The platform's data-driven insights help me prepare more effectively for patient sessions.", 
    bg: "bg-emerald-50" 
  },
  { 
    name: "Mark D.", 
    role: "Patient", 
    text: "I was skeptical about AI, but the guidance is incredibly grounded and compassionate.", 
    bg: "bg-blue-50" 
  },
  { 
    name: "Dr. Elena Vance", 
    role: "Psychiatrist", 
    text: "TheraBot bridges the gap between check-ins, keeping patients engaged with their progress.", 
    bg: "bg-emerald-50" 
  }
];

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F5F3] py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            About <span className="text-indigo-600">TheraBot</span>
          </h1>
          <p className="text-gray-600 text-lg">Compassionate technology for your mind.</p>
        </div>

        {/* Mission & Offerings */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all" data-aos="fade-right">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe mental wellness should be accessible, private, and stigma-free. TheraBot provides 24/7 grounding support when you need it most.
            </p>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all" data-aos="fade-left">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Promise</h2>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Secure & Private Environment</li>
              <li>✓ Evidence-Based Insights</li>
              <li>✓ Professional Therapist Network</li>
              <li>✓ Zero-Judgment AI Interaction</li>
            </ul>
          </section>
        </div>

        {/* Reviews Section */}
        <section className="py-8" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Voices from Our Community
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {reviews.map((review, i) => (
              <div 
                key={i} 
                className={`${review.bg} p-8 rounded-3xl border border-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-center mb-6">
                  {/* Avatar Initials Badge */}
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center font-bold text-slate-800 text-xl border border-gray-200 mr-4 shadow-inner">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{review.name}</h4>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      review.role === 'Patient' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {review.role}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 italic leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default About;
