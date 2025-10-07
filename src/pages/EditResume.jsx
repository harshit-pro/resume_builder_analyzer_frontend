// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// import GenerateResume from './GenerateResume';

// const EditResume = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { getToken } = useAuth();
//   const [resumeData, setResumeData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchResume = async () => {
//       try {
//         const token = await getToken();
//         const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL2}/api/v1/resume/${id}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
//         setResumeData(response.data);
//         setLoading(false);
//       } catch (error) {
//         /* error handled via navigation */
//         navigate('/dashboard');
//       }
//     };

//     fetchResume();
//   }, [id, getToken, navigate]);

//   if (loading) return <div className="text-center py-8">Loading resume...</div>;

//   return (
//     <GenerateResume 
//       initialData={resumeData.content} 
//       isEditing={true} 
//       resumeId={id} 
//     />
//   );
// };

// export default EditResume;


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import http from '../api/httpClient';

const EditResume = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      const token = await getToken();
      try {
        const response = await http.get(
          `/api/v1/resume/${resumeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const parsedData = response.data.content;
        setFormData(
          typeof parsedData === 'string' ? JSON.parse(parsedData) : parsedData
        );
        setLoading(false);
      } catch (err) {
      }
    };

    fetchResume();
  }, [resumeId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = await getToken();
    try {
      await http.put(
        `/api/v1/resume/${resumeId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/dashboard'); // Redirect after update
    } catch (err) {
    }
  };

  if (loading) return <div>Loading resume data...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Edit Resume</h1>

      {/* Example fields; adjust according to your structure */}
      <input
        type="text"
        name="title"
        value={formData.title || ''}
        onChange={handleChange}
        className="input input-bordered w-full mb-4"
        placeholder="Title"
      />

      <textarea
        name="summary"
        value={formData.summary || ''}
        onChange={handleChange}
        className="textarea textarea-bordered w-full mb-4"
        placeholder="Summary"
      />

      <button
        onClick={handleSubmit}
        className="btn btn-primary"
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditResume;
