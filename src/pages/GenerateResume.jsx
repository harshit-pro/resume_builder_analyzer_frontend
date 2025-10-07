import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import http from "../api/httpClient";
import toast from "react-hot-toast";
import {
  FaBrain,
  FaTrash,
  FaPaperPlane,
  FaPlusCircle,
  FaEdit,
  FaSync,
  FaQuestionCircle,
  FaArrowUp,
  FaArrowDown,
  FaSave
} from "react-icons/fa";
import { BiBook } from "react-icons/bi";
import { RiFilePaper2Line } from "react-icons/ri";
import Resume from "../component/Resume";
import { useAuth } from "../context/AuthContext";

// Constants
const EMPTY_RESUME = {
  personalInformation: {
    title: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    linkedin: "",
    gitHub: "",
    portfolio: ""
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  languages: [],
  interests: [],
  achievements: []
};

const HELP_EXAMPLES = [
  {
    title: "Software Engineer Example",
    content: "I'm a full-stack developer with 5 years of experience specializing in React, Node.js, and MongoDB. At XYZ Corp, I led a team that built a customer portal that increased user engagement by 40%. I have a Bachelor's in Computer Science from ABC University. My skills include JavaScript, TypeScript, AWS, and CI/CD pipelines."
  },
  {
    title: "Marketing Professional Example",
    content: "Digital marketing specialist with 3 years of experience in SEO, content marketing, and social media strategy. Increased organic traffic by 120% at my current company through targeted SEO campaigns. Proficient in Google Analytics, SEMrush, and HubSpot. Strong copywriting skills with experience creating high-converting landing pages."
  }
];

const GenerateResume = () => {
  // Hooks and state
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken, deductCredit, requireAuth } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const isEditing = !!resumeId;
  const [currentView, setCurrentView] = useState(isEditing ? 'form' : 'generate');
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('resumeData');
    return savedData ? JSON.parse(savedData) : EMPTY_RESUME;
  });

  // Form setup
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: data
  });

  // Field arrays
  const experienceFields = useFieldArray({ control, name: "experience" });
  const educationFields = useFieldArray({ control, name: "education" });
  const certificationsFields = useFieldArray({ control, name: "certifications" });
  const projectsFields = useFieldArray({ control, name: "projects" });
  const languagesFields = useFieldArray({ control, name: "languages" });
  const interestsFields = useFieldArray({ control, name: "interests" });
  const achievementsFields = useFieldArray({ control, name: "achievements" });
  const skillsFields = useFieldArray({ control, name: "skills" });

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(data));
  }, [data]);

  // Fetch resume for editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchResumeForEdit = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const response = await http.get(
          `/api/v1/resume/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }
        );

        const resumeContent = typeof response.data.content === 'string'
          ? JSON.parse(response.data.content)
          : response.data.content;
        const formattedResume = mapResumeToFormFormat(resumeContent);
        setTitle(response.data.title || "Untitled Resume");
        setData(formattedResume);
        reset(formattedResume);
        setCurrentView('form');
      } catch (error) {
        console.error("Error fetching resume:", error);
        toast.error("Failed to fetch your resume");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchResumeForEdit();
  }, [isEditing, resumeId, getToken, navigate, reset]);

  // API handlers
  const handleGenerate = useCallback(async () => {
    if (!requireAuth('generate a resume')) return;

    try {
      setLoading(true);
      const token = await getToken();
      const response = await http.post(
        `/api/v1/resume/generate`,
        { userDescription: description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resumeData = response.data;
      const formattedResume = mapResumeToFormFormat(resumeData);

      const creditDeducted = await deductCredit('resume_build');
      if (!creditDeducted) {
        throw new Error("Failed to deduct credit");
      }

      reset(formattedResume);
      setData(formattedResume);
      toast.success("Resume Generated! Click Save to store it.");
      setCurrentView('form');
    } catch (error) {
      toast.error("Generation failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [description, getToken, requireAuth, deductCredit, reset]);

  const handleSave = useCallback(async (formData, isEdit) => {
    try {
      setLoading(true);
      const token = await getToken();

      const payload = {
        title: title || formData.personalInformation?.fullName
          ? `${title || formData.personalInformation.fullName}'s Resume`
          : "Untitled Resume",
        content: formData
      };

      const url = isEdit
        ? `/api/v1/resume/${resumeId}`
        : `/api/v1/resume`;

      const method = isEdit ? 'put' : 'post';
      const response = await http[method](
        url,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(`Resume ${isEdit ? 'updated' : 'saved'} successfully!`);

      if (!isEdit) {
        navigate(`/edit-resume/${response.data.id}`, { replace: true });
      } else {
        navigate("/dashboard");
      }

      setData(formData);
      setCurrentView('resume');
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save resume"
      );
    } finally {
      setLoading(false);
    }
  }, [title, resumeId, getToken, navigate]);

  const onSubmit = useCallback(async (formData) => {
    await handleSave(formData, isEditing);
  }, [handleSave, isEditing]);

  // View handlers
  const handleClear = useCallback(() => setDescription(""), []);

  const handleClearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all data and start over?")) {
      localStorage.removeItem('resumeData');
      setData(EMPTY_RESUME);
      setDescription("");
      setCurrentView('generate');
      toast.success("All data cleared successfully!");
      navigate('/generate-resume', { replace: true });
    }
  }, [navigate]);

  // Resume data mapper
  const mapResumeToFormFormat = useCallback((resumeData) => {
    const formattedResume = {
      personalInformation: {
        fullName: "",
        email: "",
        phoneNumber: "",
        location: "",
        linkedin: "",
        gitHub: "",
        portfolio: ""
      },
      summary: "",
      skills: [],
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      languages: [],
      interests: [],
      achievements: []
    };

    try {
      // Personal Information
      if (resumeData.personalInformation) {
        formattedResume.personalInformation = {
          ...formattedResume.personalInformation,
          ...resumeData.personalInformation
        };
      }

      // Summary
      if (resumeData.summary) {
        formattedResume.summary = resumeData.summary || resumeData.professionalSummary || "";
      } else if (resumeData.summaryText) {
        formattedResume.summary = resumeData.summaryText || resumeData.summary || "";
      }
      // Skills
      if (Array.isArray(resumeData.skills)) {
        formattedResume.skills = resumeData.skills.map(skill => ({
          title: typeof skill === "string" ? skill : skill.title || skill.name || "",
          level: typeof skill === "string" ? "" : skill.level || ""
        }));
      }
      // Experience
      if (Array.isArray(resumeData.experience)) {
        formattedResume.experience = resumeData.experience.map(exp => ({
          jobTitle: exp.jobTitle || exp.title || exp.position || "",
          company: exp.company || exp.organization || "",
          location: exp.location || "",
          duration: exp.duration || "",
          description: exp.description || ""
        }));
      }

      // Education
      if (Array.isArray(resumeData.education)) {
        formattedResume.education = resumeData.education.map(edu => ({
          degree: edu.degree || "",
          university: edu.university || edu.institution || "",
          Marks: edu.marks || edu.Marks || "",
          location: edu.location || "",
          graduationYear: edu.graduationYear || ""
        }));
      }

      // Certifications
      if (Array.isArray(resumeData.certifications)) {
        formattedResume.certifications = resumeData.certifications.map(cert => ({
          title: cert.title || cert.name || "",
          issuingOrganization: cert.issuingOrganization || cert.organization || "",
          year: cert.year || cert.date || ""
        }));
      }

      // Projects
      if (Array.isArray(resumeData.projects)) {
        formattedResume.projects = resumeData.projects.map(project => ({
          title: project.title || project.name || "",
          description: project.description || "",
          technologiesUsed: project.technologiesUsed || project.techStack || "",
          githubLink: project.githubLink || project.github || "",
          LiveLink: project.liveLink || project.url || ""
        }));
      }

      // Languages
      if (Array.isArray(resumeData.languages)) {
        formattedResume.languages = resumeData.languages.map(lang => ({
          name: lang.name || lang.language || ""
        }));
      }

      // Interests
      if (Array.isArray(resumeData.interests)) {
        formattedResume.interests = resumeData.interests.map(interest => ({
          name: interest.name || interest.title || ""
        }));
      }

      // Achievements
      if (Array.isArray(resumeData.achievements)) {
        formattedResume.achievements = resumeData.achievements.map(achievement => ({
          title: achievement.title || achievement.name || "",
          description: achievement.description || "",
          link: achievement.link || ""
        }));
      }

      return formattedResume;
    } catch (error) {
      console.error("Error mapping resume data:", error);
      return formattedResume;
    }
  }, []);

  // UI Components
  const HelpDialog = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowHelpDialog(false)}
    >
      <motion.div
        className="bg-base-100 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary">How to Write a Good Description</h3>
          <button
            onClick={() => setShowHelpDialog(false)}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm mb-4">
            Provide a detailed description of your professional background, including:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-2 mb-4">
            <li>Your Personal details like name, address, email, phone number</li>
            <li>Your job titles and years of experience</li>
            <li>Key achievements and responsibilities</li>
            <li>Education and certifications</li>
            <li>Technical skills and tools</li>
          </ul>
        </div>

        <h4 className="font-semibold mb-3">Example Descriptions:</h4>
        <div className="space-y-4">
          {HELP_EXAMPLES.map((example, index) => (
            <div key={index} className="bg-base-200 p-4 rounded-lg">
              <h5 className="font-medium text-accent mb-2">{example.title}</h5>
              <p className="text-sm">{example.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowHelpDialog(false)}
            className="btn btn-primary"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const HelpButton = () => {
    if (currentView !== 'generate') return null;

    return (
      <motion.button
        onClick={() => setShowHelpDialog(true)}
        className="fixed right-4 md:right-10 bottom-20 btn btn-circle btn-primary shadow-lg z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <FaQuestionCircle className="text-xl" />
      </motion.button>
    );
  };

  const ScrollButtons = () => {
    if (currentView !== 'form') return null;

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    return (
      <div className="fixed right-4 md:right-6 bottom-6 flex flex-col gap-2 z-50">
        <motion.button
          onClick={scrollToTop}
          className="btn btn-circle btn-sm btn-primary shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp />
        </motion.button>
        <motion.button
          onClick={scrollToBottom}
          className="btn btn-circle btn-sm btn-primary shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowDown />
        </motion.button>
      </div>
    );
  };

  const renderInput = (name, label, type = "text") => (
    <motion.div
      className="form-control w-full mb-2"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <label className="label">
        <span className="label-text font-medium">{formatLabel(label)}</span>
      </label>
      <input
        type={type}
        placeholder={formatLabel(label)}
        {...register(name)}
        className="input input-bordered w-full focus:ring-2 focus:ring-accent/70 bg-base-200/50 backdrop-blur-sm"
      />
    </motion.div>
  );

  // Label formatter for keys like jobTitle -> Job Title, gitHub -> GitHub, LiveLink -> Live Link
  const formatLabel = (raw) => {
    if (!raw) return "";
    const overrides = {
      gitHub: "GitHub",
      LiveLink: "Live Link",
      graduationYear: "Graduation Year",
      technologiesUsed: "Technologies Used",
      phoneNumber: "Phone Number",
      issuingOrganization: "Issuing Organization",
      jobTitle: "Job Title",
    };
    if (overrides[raw]) return overrides[raw];
    const withSpaces = String(raw)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2");
    return withSpaces
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const sectionHints = {
    skills: "Add your core competencies and select proficiency.",
    experience: "List your roles, achievements, and timelines.",
    education: "Include degrees, institution, and graduation year.",
    certifications: "Add relevant certifications with issuer and year.",
    projects: "Showcase projects, tech stack, and links.",
    achievements: "Highlight awards or notable accomplishments.",
    languages: "Add languages you can speak or write.",
    interests: "Optionally list relevant interests.",
  };

  const [collapsed, setCollapsed] = useState({});

  const renderFieldArray = (fields, label, name, keys) => (
    <motion.div
      className="form-control w-full mb-6 p-5 glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <RiFilePaper2Line className="text-accent" /> {label}
          </h3>
          {sectionHints[name] && (
            <p className="text-sm opacity-70 mt-1">{sectionHints[name]}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setCollapsed((c) => ({ ...c, [name]: !c[name] }))}
            className="btn btn-ghost btn-xs"
            title={collapsed[name] ? "Expand section" : "Collapse section"}
            whileHover={{ scale: 1.05 }}
          >
            {collapsed[name] ? "Expand" : "Collapse"}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => fields.prepend(keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}))}
            className="btn btn-secondary btn-sm"
            title={`Add ${label}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlusCircle className="mr-1" /> Add {label}
          </motion.button>
        </div>
      </div>

      {collapsed[name] ? (
        <div className="mt-2 text-sm opacity-70">Section collapsed</div>
      ) : fields.fields.length === 0 ? (
        <div className="mt-4 border-2 border-dashed border-base-300/70 rounded-xl p-6 text-center">
          <p className="opacity-70 mb-3">No {label.toLowerCase()} added yet.</p>
          <motion.button
            type="button"
            onClick={() => fields.prepend(keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}))}
            className="btn btn-secondary btn-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlusCircle className="mr-1" /> Add first {label}
          </motion.button>
        </div>
      ) : fields.fields.map((field, index) => (
        <motion.div
          key={field.id}
          className="p-4 glass rounded-xl mb-4 shadow-sm border border-white/40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="badge badge-accent badge-outline">{label} #{index + 1}</div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                disabled={index === 0}
                onClick={() => fields.move(index, index - 1)}
                className="btn btn-ghost btn-xs"
                title="Move up"
                whileHover={{ scale: 1.1 }}
              >
                <FaArrowUp />
              </motion.button>
              <motion.button
                type="button"
                disabled={index === fields.fields.length - 1}
                onClick={() => fields.move(index, index + 1)}
                className="btn btn-ghost btn-xs"
                title="Move down"
                whileHover={{ scale: 1.1 }}
              >
                <FaArrowDown />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => fields.remove(index)}
                className="btn btn-error btn-xs"
                title="Remove"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTrash />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keys.map((key) => {
              const fieldName = `${name}.${index}.${key}`;
              if (key.toLowerCase().includes("description")) {
                return (
                  <div className="md:col-span-2" key={fieldName}>
                    <label className="label">
                      <span className="label-text font-medium">{formatLabel(key)}</span>
                    </label>
                    <textarea
                      {...register(fieldName)}
                      rows={3}
                      placeholder={formatLabel(key)}
                      className="textarea textarea-bordered w-full focus:ring-2 focus:ring-accent/70 bg-base-200/50 backdrop-blur-sm"
                    />
                  </div>
                );
              }
              if (name === "skills" && key === "level") {
                return (
                  <div key={fieldName}>
                    <label className="label">
                      <span className="label-text font-medium">Proficiency</span>
                    </label>
                    <select
                      {...register(fieldName)}
                      className="select select-bordered w-full bg-base-200/50 backdrop-blur-sm"
                    >
                      <option value="">Select level</option>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                );
              }
              return (
                <React.Fragment key={fieldName}>
                  {renderInput(fieldName, formatLabel(key))}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Derived values
  const showPromptInput = currentView === 'generate';
  const showFormUI = currentView === 'form';
  const showResumeUI = currentView === 'resume';

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 px-4 py-8 md:py-12 ">
      <HelpButton />
      {showHelpDialog && <HelpDialog />}
      <ScrollButtons />

      <AnimatePresence mode="wait">
        {showPromptInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-base-100 shadow-2xl rounded-2xl p-6 md:p-8 max-w-3xl mx-auto relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>

            <motion.div
              className="flex flex-col items-center mb-6 md:mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., SDE at Google, AI/ML Resume"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <FaBrain className="text-4xl md:text-5xl text-accent mb-2 z-10 relative" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-md -z-10"></div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mt-2">
                Smart Resume Creator
              </h1>
              <p className="text-base md:text-lg opacity-80 mt-2 text-center">
                Let AI craft your perfect resume from description
              </p>
            </motion.div>

            <div className="relative mb-6 md:mb-8 group">
              <motion.textarea
                disabled={loading}
                className="textarea textarea-bordered w-full h-48 md:h-64 text-base md:text-lg p-4 bg-base-200/50 backdrop-blur-sm border-2 border-base-300 focus:border-accent transition-all duration-300 rounded-xl"
                placeholder=" "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <motion.label
                className="absolute left-4 top-1 text-base-content/50 pointer-events-none transition-all duration-300 group-focus-within:-translate-y-7 group-focus-within:scale-90 group-focus-within:text-accent group-focus-within:bg-base-100 group-focus-within:px-2 group-focus-within:rounded-lg"
              >
                Describe your skills, experience and achievements...
              </motion.label>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
              <motion.button
                disabled={loading}
                onClick={handleGenerate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-md md:btn-lg rounded-full px-6 md:px-8 shadow-lg flex items-center gap-3 relative overflow-hidden"
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Generate Resume</span>
                  </>
                )}
              </motion.button>

              <motion.button
                disabled={loading}
                onClick={handleClear}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline btn-md md:btn-lg rounded-full px-6 md:px-8 flex items-center gap-3"
              >
                <FaTrash />
                <span>Clear</span>
              </motion.button>
            </div>

            {loading && (
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-8 right-8 text-4xl md:text-6xl opacity-10"
              >
                <RiFilePaper2Line />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showFormUI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto px-4 py-6"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/40">
            <div className="sticky top-20 z-20 glass rounded-xl p-4 -mx-2 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  <BiBook className="text-accent" />
                  {isEditing ? 'Edit Resume' : 'Resume Builder'}
                </h1>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <motion.button
                    onClick={() => setCurrentView('resume')}
                    className="btn btn-accent btn-sm md:btn-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaEdit className="mr-2" /> Preview
                  </motion.button>
                  <motion.button
                    onClick={handleClearAll}
                    className="btn btn-error btn-sm md:btn-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaTrash className="mr-2" /> Clear All
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-primary btn-sm md:btn-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaSave className="mr-2" /> My Resumes
                  </motion.button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {renderInput("personalInformation.fullName", "Full Name")}
                {renderInput("personalInformation.email", "Email", "email")}
                {renderInput("personalInformation.phoneNumber", "Phone Number", "tel")}
                {renderInput("personalInformation.location", "Location")}
                {renderInput("personalInformation.linkedin", "LinkedIn", "url")}
                {renderInput("personalInformation.gitHub", "GitHub", "url")}
                {renderInput("personalInformation.portfolio", "Portfolio", "url")}
              </div>

              <motion.div
                className="glass p-4 md:p-6 rounded-xl border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Professional Summary</h3>
                <textarea
                  {...register("summary")}
                  placeholder="A concise summary highlighting your experience, skills, and impact."
                  className="textarea textarea-bordered w-full focus:ring-2 focus:ring-accent/70 bg-base-200/50 backdrop-blur-sm"
                  rows={4}
                />
              </motion.div>

              {renderFieldArray(skillsFields, "Skills", "skills", ["title", "level"])}
              {renderFieldArray(experienceFields, "Work Experience", "experience", ["jobTitle", "company", "location", "duration", "description"])}
              {renderFieldArray(educationFields, "Education", "education", ["degree", "university", "Marks", "location", "graduationYear"])}
              {renderFieldArray(certificationsFields, "Certifications", "certifications", ["title", "issuingOrganization", "year"])}
              {renderFieldArray(projectsFields, "Projects", "projects", ["title", "description", "technologiesUsed", "githubLink", "LiveLink"])}
              {renderFieldArray(achievementsFields, "Achievements", "achievements", ["title", "description", "link"])}
              {renderFieldArray(languagesFields, "Languages", "languages", ["name"])}
              {renderFieldArray(interestsFields, "Interests", "interests", ["name"])}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4 mt-6 md:mt-8">
                <motion.button
                  type="button"
                  onClick={() => setCurrentView('generate')}
                  className="btn btn-outline btn-sm md:btn-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaSync className="mr-2" /> Start Over
                </motion.button>
                <motion.button
                  type="submit"
                  className="btn btn-primary btn-sm md:btn-md"
                  whileHover={{ scale: 1.05 }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <span>Save Resume</span>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {showResumeUI && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto px-4 py-6"
        >
          <Resume data={data} />
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
            <motion.button
              onClick={() => setCurrentView('form')}
              className="btn btn-accent btn-sm md:btn-md"
              whileHover={{ scale: 1.05 }}
            >
              <FaEdit className="mr-2" /> Edit Resume
            </motion.button>
            <motion.button
              onClick={() => setCurrentView('generate')}
              className="btn btn-primary btn-sm md:btn-md"
              whileHover={{ scale: 1.05 }}
            >
              <FaSync className="mr-2" /> Create New
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary btn-sm md:btn-md"
              whileHover={{ scale: 1.05 }}
            >
              <FaSave className="mr-2" /> My Resumes
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GenerateResume;