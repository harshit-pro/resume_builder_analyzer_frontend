import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import http from '../api/httpClient';
import { FaEdit, FaTrash, FaPlus, FaEye, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboards = () => {
  const { getToken } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = await getToken();
      const response = await http.get(`/api/v1/resume/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setResumes(response.data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        const token = await getToken();
        await http.delete(`/api/v1/resume/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success(`"${title}" deleted successfully`);
        fetchResumes();
      } catch (err) {
        toast.error("Failed to delete resume.");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] mt-16">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-gray-500">Loading your resumes...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 pt-24">
      <div className="alert alert-error max-w-2xl mx-auto my-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold">Error loading resumes!</h3>
          <div className="text-xs">{error}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-8 pt-24 pb-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Resumes</h1>
          <p className="text-gray-500 mt-1">Manage and edit your resume collection</p>
        </div>
        <Link
          to="/generate-resume"
          state={{ fromDashboard: true }}
          className="btn btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <FaPlus /> Create New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="card bg-base-100 shadow-lg max-w-2xl mx-auto mt-8">
          <div className="card-body text-center py-12">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
              <FaFileAlt className="text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Resumes Found</h2>
            <p className="text-gray-500 mb-6">Get started by creating your first professional resume</p>
            <Link
              to="/generate-resume"
              state={{ fromDashboard: true }}
              className="btn btn-primary mx-auto"
            >
              Create Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {resumes.map((resume) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="card bg-base-100 border border-gray-200 hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              <div className="card-body flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100/50 text-blue-600 p-2 rounded-lg">
                      <FaFileAlt className="text-lg" />
                    </div>
                    <h2 className="card-title text-lg font-semibold line-clamp-1" title={resume.title}>
                      {resume.title}
                    </h2>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-1 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Created:</span>
                    <span>
                      {new Date(resume.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <span className="text-xs ml-1">
                        {new Date(resume.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Updated:</span>
                    <span>
                      {new Date(resume.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      <span className="text-xs ml-1">
                        {new Date(resume.updatedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions p-4 border-t border-gray-100">
                <div className="flex justify-between w-full gap-2">
                  <Link
                    to={`/resume/${resume.id}`}
                    className="btn btn-sm btn-ghost flex items-center gap-2 hover:bg-gray-100"
                    title="Preview"
                  >
                    <FaEye className="text-gray-500" />
                  </Link>

                  <div className="flex gap-2">
                    <Link
                      to={`/edit-resume/${resume.id}`}
                      className="btn btn-sm btn-outline btn-primary flex items-center gap-2"
                    >
                      <FaEdit /> Edit
                    </Link>

                    <button
                      onClick={() => deleteResume(resume.id, resume.title)}
                      className="btn btn-sm btn-outline btn-error flex items-center gap-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboards;