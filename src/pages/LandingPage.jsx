

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Pricing from "../component/Pricing";
// import { FaLinkedin, FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";
// import Pricing from "../component/Pricing";

const LandingPage = () => {
  return (
    <div className="mt-10 min-h-screen bg-gray-100 flex flex-col items-center px-6 md:px-16 py-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl text-center mb-10 glass-card p-8"
      >
        <h1 className=" text-4xl md:text-5xl font-bold text-gray-800">Revolutionize Your Resume with AI</h1>
        <p className="mt-4 text-lg text-gray-600">
          Create a professional resume in seconds using AI-driven insights and modern templates.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mb-8" >


        {/* Resume Analyzer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 max-w-5xl text-center glass-card p-10"
        >
          <h2 className="text-3xl font-bold text-gray-800">Try Our Resume Analyzer</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get personalized feedback on your resume to improve its impact.
          </p>
          <Link to="/resume-analyzer" className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg mt-6 inline-block">
            Analyze Your Resume
          </Link>
        </motion.div>

        {/* Resume Generator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 max-w-5xl text-center glass-card p-10"
        >
          <h2 className="text-3xl font-bold text-gray-800">Generate a Resume Instantly</h2>
          <p className="mt-4 text-lg text-gray-600">
            Use AI to create a resume tailored to your skills and experience.
          </p>
          <Link to="/generate-resume" className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg mt-6 inline-block">
            Generate Your Resume
          </Link>
        </motion.div>

      </div>

      <div>
        {/* <Pricing /> */}
      </div>
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="p-6 glass-card text-center border border-white/40 hover:shadow-xl transition"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
            <p className="text-gray-600 mt-2">{feature.description}</p>
          </motion.div>
        ))}
      </div>



      <Pricing />

      {/* Testimonials Section */}
      <div className="mt-16 max-w-5xl text-center">
        <h2 className="text-3xl font-bold text-gray-800">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200"
            >
              <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              <h4 className="mt-4 font-semibold text-gray-800">- {testimonial.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>



      {/* Footer removed: now rendered globally in Root via <Footer /> */}
    </div>
  );
};

const features = [
  { title: "AI-Powered Writing", description: "Generate bullet points tailored to your skills.", icon: "🤖" },
  { title: "Beautiful Templates", description: "Choose from sleek, ATS-friendly designs.", icon: "🎨" },
  { title: "Instant Formatting", description: "Effortlessly format your resume with one click.", icon: "⚡" },
  { title: "PDF Download", description: "Export your resume as a high-quality PDF instantly.", icon: "📄" },
  { title: "Live Editing", description: "Make real-time changes and see instant previews.", icon: "✏️" }
];

const testimonials = [
  { quote: "This AI resume builder saved me hours of work!", name: "John Doe" },
  { quote: "A game-changer for job seekers. Super easy to use!", name: "Jane Smith" }
];

export default LandingPage;
