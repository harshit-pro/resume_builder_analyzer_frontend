import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import http from '../api/httpClient';
import PDFResume, { PDFDownloadButton } from '../component/PDFResume';
import { PDFViewer } from '@react-pdf/renderer';
// import { getTemplate, templates } from '../component/PDFTemplates';

const ResumeViewer = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = await getToken();
        const response = await http.get(`/api/v1/resume/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setResumeData(response.data.content);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id, getToken]);

  if (loading) return <div>Loading resume...</div>;
  if (!resumeData) return <div>Resume not found</div>;

  return (
    <div className="container mx-auto px-9 py-24">
      <div className="flex justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">View Resume</h1>
        <div className="flex gap-2 items-center">
          <PDFDownloadButton data={resumeData} />
          {/* Optionally link to editor route */}
          {/* <Link to={`/edit-resume/${id}`} className="btn btn-primary">Edit</Link> */}
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] border rounded-md overflow-hidden bg-gray-50">
        <PDFViewer width="100%" height="100%" className="w-full h-full">
          <PDFResume data={resumeData} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default ResumeViewer;