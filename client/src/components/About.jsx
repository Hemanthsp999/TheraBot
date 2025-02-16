import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">About <span className="text-indigo-700">TheraBot</span></h1>
      
      <div className="space-y-6 text-gray-800">
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Our Mission</h2>
          <p className="mb-4">
            TheraBot is dedicated to making mental health support accessible to everyone, everywhere. 
            We combine artificial intelligence with human expertise to provide comprehensive mental wellness solutions.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>24/7 AI-powered mental health support</li>
            <li>Confidential and judgment-free environment</li>
            <li>Evidence-based therapeutic approaches</li>
            <li>Connection to professional therapists</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-500">Accessibility</h3>
              <p>Making mental health support available to all</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-500">Privacy</h3>
              <p>Ensuring confidentiality and data protection</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-500">Innovation</h3>
              <p>Leveraging technology for better mental health care</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-500">Empathy</h3>
              <p>Providing compassionate and understanding support</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Our Team</h2>
          <p>
            TheraBot is built by a dedicated team of mental health professionals, AI specialists, 
            and developers committed to improving mental health support through technology.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About; 