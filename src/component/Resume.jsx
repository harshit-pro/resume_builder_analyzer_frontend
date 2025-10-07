

import { FaGithub, FaLinkedin, FaPhone, FaEnvelope, FaExternalLinkAlt } from "react-icons/fa";
import { PiReadCvLogoFill } from "react-icons/pi";
import { PDFDownloadButton } from "./PDFResume";
import './Resume.css';

const Resume = ({ data }) => {
  return (
    <div className="resume-container max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-800">
      {/* Compact Header */}
      <div className="header-section flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {data.personalInformation?.fullName || "Your Name"}
          </h1>
          <p className="text-xs text-gray-500">
            {data.personalInformation?.location || "Location"}
          </p>
        </div>
        
        <div className="contact-info flex flex-wrap gap-2 text-xs">
          {data.personalInformation?.email && (
            <a href={`mailto:${data.personalInformation.email}`} className="flex items-center gap-1 hover:text-blue-600">
              <FaEnvelope size={12} />
            </a>
          )}
          {data.personalInformation?.phoneNumber && (
            <a href={`tel:${data.personalInformation.phoneNumber}`} className="flex items-center gap-1 hover:text-blue-600">
              <FaPhone size={12} />
            </a>
          )}
          {data.personalInformation?.gitHub && (
            <a href={data.personalInformation.gitHub} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <FaGithub size={12} />
            </a>
          )}
          {data.personalInformation?.linkedIn && (
            <a href={data.personalInformation.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <FaLinkedin size={12} />
            </a>
          )}
          {data.personalInformation?.portfolio && (
            <a href={data.personalInformation.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <PiReadCvLogoFill size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Summary - Single line if possible */}
      {data.summary && (
        <div className="summary-section mb-4">
          <p className="text-xs text-gray-700 line-clamp-2">{data.summary}</p>
        </div>
      )}

      {/* Skills - Compact chips */}
      {data.skills?.length > 0 && (
        <div className="skills-section mb-4">
          <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, index) => (
              <span key={index} className="skill-chip px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                {skill.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience - Compact timeline */}
      {data.experience?.length > 0 && (
        <div className="experience-section mb-4">
          <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Experience</h2>
          <div className="space-y-2">
            {data.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium">{exp.jobTitle}</h3>
                  <span className="text-xs text-gray-500">{exp.duration}</span>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-gray-600">{exp.company}, {exp.location}</p>
                </div>
                {exp.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education - Compact format */}
      {data.education?.length > 0 && (
        <div className="education-section mb-4">
          <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Education</h2>
          <div className="space-y-1">
            {data.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{edu.degree}</h3>
                  <span className="text-xs text-gray-500">{edu.graduationYear}</span>
                </div>
                <p className="text-xs text-gray-600">{edu.university}</p>
                {edu.Marks && (
                  <p className="text-xs text-gray-500">Marks: {edu.Marks}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects - Compact cards */}
      {data.projects?.length > 0 && (
        <div className="projects-section mb-4">
          <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Projects</h2>
          <div className="grid grid-cols-1 gap-2">
            {data.projects.map((proj, index) => (
              <div key={index} className="project-card p-2 border border-gray-100 rounded">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">{proj.title}</h3>
                  {proj.githubLink && (
                    <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-0.5">
                      <FaExternalLinkAlt size={10} />
                    </a>
                  )}
                </div>
                {proj.technologiesUsed && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {Array.isArray(proj.technologiesUsed) 
                      ? proj.technologiesUsed.slice(0, 3).join(", ") 
                      : proj.technologiesUsed}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications - Single line */}
      {data.certifications?.length > 0 && (
        <div className="certifications-section mb-4">
          <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Certifications</h2>
          <div className="space-y-1">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between">
                <p className="text-xs">{cert.title}</p>
                <span className="text-xs text-gray-500">{cert.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages & Interests - Combined in one row */}
      {(data.languages?.length > 0 || data.interests?.length > 0) && (
        <div className="misc-section flex flex-wrap gap-4 mb-4">
          {data.languages?.length > 0 && (
            <div>
              <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Languages</h2>
              <div className="flex flex-wrap gap-1">
                {data.languages.map((lang, index) => (
                  <span key={index} className="text-xs">{lang.name}</span>
                ))}
              </div>
            </div>
          )}
          
          {data.interests?.length > 0 && (
            <div>
              <h2 className="section-title text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Interests</h2>
              <div className="flex flex-wrap gap-1">
                {data.interests.map((interest, index) => (
                  <span key={index} className="text-xs">{interest.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Button - Small and centered */}
      <div className="flex justify-center mt-4">
        <PDFDownloadButton data={data} className="text-xs py-1 px-3" />
      </div>
    </div>
  );
};

export default Resume;

