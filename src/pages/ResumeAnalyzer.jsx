

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from "react";
import analyzer from "../api/analyzerClient";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResumeAnalyzer = () => {
  const { deductCredit, requireAuth } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [cooldownSecs, setCooldownSecs] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResume(file);
      setResumeFileName(file.name);
    }
  };
  const handleSubmit = async (event) => {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    if (!requireAuth('analyze your resume')) return;

    if (!jobDescription || !resume) {
      toast.error("Please provide both Job Description and Resume.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Clear previous analysis so we don't show stale results if this attempt fails
      setAnalysis(null);

      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      formData.append("resume", resume);

      console.log("Submitting data to backend:");
      const isRetryableError = (err) => {
        const status = err?.response?.status;
        const code = err?.code;
        const message = String(err?.message || '').toLowerCase();
        return (
          status === 504 || status === 502 || status === 503 ||
          code === 'ECONNABORTED' || message.includes('timeout')
        );
      };

      const maxAttempts = 2;
      let response;
      let attempt = 0;
      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          response = await analyzer.post(
            `/analyze`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 90000, // 90 seconds client-side timeout
            }
          );
          break; // success
        } catch (err) {
          if (attempt < maxAttempts && isRetryableError(err)) {
            const backoffMs = attempt * 1500;
            console.warn(`Analyze attempt ${attempt} failed, retrying in ${backoffMs}ms...`, err?.message);
            await new Promise((r) => setTimeout(r, backoffMs));
            continue;
          }
          // If it's a retryable error on last attempt, start a short cooldown
          if (isRetryableError(err)) {
            let secs = 8; // small cooldown window
            setCooldownSecs(secs);
            const timer = setInterval(() => {
              secs -= 1;
              setCooldownSecs((s) => (s > 0 ? s - 1 : 0));
              if (secs <= 0) clearInterval(timer);
            }, 1000);
          }
          throw err; // non-retryable or last attempt
        }
      }
      console.log("Response from backend:", response.data);
      // Normalize payload: parse JSON strings and allow optional wrappers
      let payload = response?.data ?? {};
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.warn('Analyzer returned a string that is not valid JSON; using raw string.');
        }
      }

      // If backend signals error in a JSON body, surface it and exit early
      const directErrorMsg = (payload && typeof payload === 'object') ? (payload.error || payload.message) : undefined;
      const directErrorDetail = (payload && typeof payload === 'object') ? (payload.details || payload.detail) : undefined;
      if (directErrorMsg) {
        const detailText = typeof directErrorDetail === 'string'
          ? directErrorDetail
          : (directErrorDetail ? JSON.stringify(directErrorDetail) : '');
        const composed = detailText ? `${directErrorMsg}: ${detailText}` : directErrorMsg;
        setError(composed);
        toast.error(composed);
        return;
      }

      // Build candidate objects to search for fields
      const candidates = [];
      const pushObj = (obj) => {
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) candidates.push(obj);
      };
      pushObj(payload);
      const wrapperKeys = ['data', 'result', 'analysis', 'output', 'response', 'payload'];
      if (payload && typeof payload === 'object') {
        for (const wk of wrapperKeys) pushObj(payload[wk]);
        // also consider first-level object children that look like analysis blocks
        Object.values(payload).forEach(v => pushObj(v));
      }

      // Helper: normalize key for matching (case/format insensitive)
      const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '');

      // Helper: find value by any of the synonym keys across candidates
      const findValue = (synonyms) => {
        const target = synonyms.map(norm);
        for (const obj of candidates) {
          const map = new Map(Object.keys(obj || {}).map(key => [norm(key), key]));
          for (const tk of target) {
            if (map.has(tk)) {
              const originalKey = map.get(tk);
              const val = obj[originalKey];
              if (val !== undefined && val !== null) return val;
            }
          }
        }
        return undefined;
      };

      // Extract fields with broad synonym support
      const rawScore = findValue([
        'matchScore', 'match_score', 'JD Match', 'jd_match', 'score', 'Score',
        'jd match percentage', 'jdMatchPercentage', 'ats_score', 'ats score', 'percentage', 'percent'
      ]);
      const rawMissing = findValue([
        'missingKeywords', 'missing_keywords', 'MissingKeywords', 'missing_keys', 'keywords_missing',
        'missing keywords list', 'missingKeywordsList', 'missing', 'missing_terms'
      ]) ?? [];
      const rawSummary = findValue([
        'profileSummary', 'profile_summary', 'Profile Summary', 'recommendations', 'summary', 'analysis',
        'ai_recommendations', 'ai recommendations', 'feedback', 'insights'
      ]) ?? '';

      // Normalize score to a number in [0,100]
      let numericScore = undefined;
      if (typeof rawScore === 'string') {
        const cleaned = rawScore.replace(/%/g, '').trim();
        const parsed = parseFloat(cleaned);
        numericScore = Number.isFinite(parsed) ? parsed : undefined;
      } else if (typeof rawScore === 'number') {
        numericScore = rawScore;
      }
      if (Number.isFinite(numericScore)) {
        numericScore = Math.max(0, Math.min(100, Math.round(numericScore)));
      }

      // Normalize missing keywords to an array of strings
      let missingKeywords = [];
      if (Array.isArray(rawMissing)) {
        missingKeywords = rawMissing.map(String).filter(Boolean);
      } else if (typeof rawMissing === 'string') {
        missingKeywords = rawMissing
          .split(/[,\n]/)
          .map(s => s.trim())
          .filter(Boolean);
      }

      const profileSummary = typeof rawSummary === 'string' && rawSummary.trim().length > 0
        ? rawSummary
        : 'No summary available';

      // If we couldn't extract anything meaningful, surface a format error (show best-guess message keys)
      const backendMsgRaw = (payload && typeof payload === 'object')
        ? (payload.message || payload.error || payload.detail || payload.statusText)
        : undefined;
      const backendMsg = typeof backendMsgRaw === 'string' ? backendMsgRaw : (backendMsgRaw ? JSON.stringify(backendMsgRaw) : undefined);
      if (!Number.isFinite(numericScore) && missingKeywords.length === 0 && profileSummary === 'No summary available') {
        const msg = backendMsg || 'Unexpected response format from analyzer.';
        setError(msg);
        toast.error(msg);
      } else {
        const newAnalysis = {
          matchScore: Number.isFinite(numericScore) ? numericScore : 0,
          missingKeywords,
          profileSummary,
        };
        console.log("Analysis results:", newAnalysis);

        // Deduct credit AFTER successful analysis
        const creditDeducted = await deductCredit('resume_analysis');
        console.log("Credit deduction status:", creditDeducted?.success ?? creditDeducted);
        if (!creditDeducted) {
          throw new Error("Failed to deduct credit");
        }

        // Set analysis results AFTER credit deduction
        setAnalysis(newAnalysis);
        toast.success("Resume analyzed successfully!");
      }
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      toast.error(err.message || "Failed to analyze resume");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    if (loading || cooldownSecs > 0) return;
    // Reuse current form state (jobDescription + resume) to resubmit
    handleSubmit({ preventDefault: () => { } });
  };

  const handleClearData = () => {
    setJobDescription("");
    setResume(null);
    setResumeFileName("");
    setAnalysis(null);
    setError(null);
    localStorage.removeItem('resumeAnalyzerData');
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
        {/* Floating header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">ResumeIQ Analyzer</h1>
              <p className="text-blue-100">AI-powered resume optimization for ATS systems</p>
            </div>
          </div>
        </div>

        {/* Main content with subtle pattern */}
        <div className="p-8 relative">
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjJnIGZpbGw9IiMxMTExMTEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Job Description Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Job Description</label>
              <textarea
                className="w-full p-4 border-0 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[120px]"
                placeholder="Paste the job description you're applying for..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            {/* File Upload Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Your Resume</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    id="resume-upload"
                    name="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex items-center cursor-pointer border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg px-6 py-3 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {resumeFileName ? "Change PDF" : "Upload PDF Resume"}
                  </label>
                </div>

                {resumeFileName && (
                  <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{resumeFileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className={`flex-1 p-4 rounded-xl text-white font-bold tracking-wide shadow-lg transition-all ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Analyze Resume
                  </span>
                )}
              </button>

              {(jobDescription || resumeFileName || analysis) && (
                <button
                  type="button"
                  onClick={handleClearData}
                  className="p-4 rounded-xl bg-gray-100 text-gray-700 font-bold tracking-wide shadow hover:bg-gray-200 transition-all"
                >
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </span>
                </button>
              )}
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="mb-2">{error}</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    disabled={loading || cooldownSecs > 0}
                    className={`px-3 py-1.5 rounded-md font-medium border transition-colors ${loading || cooldownSecs > 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                      }`}
                  >
                    {cooldownSecs > 0 ? `Try again in ${cooldownSecs}s` : 'Try again'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="mt-8 space-y-6">
              {/* Score Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Your ATS Match Score</h3>
                    <p className="text-sm text-gray-500">Higher scores increase interview chances</p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                          strokeDasharray={`${Number(analysis.matchScore) || 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{Number.isFinite(Number(analysis.matchScore)) ? `${Number(analysis.matchScore)}%` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Missing Keywords</h3>
                {analysis.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((kw, index) => (
                      <span
                        key={index}
                        className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1.5 rounded-full flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Excellent! Your resume contains all important keywords.
                  </div>
                )}
              </div>

              {/* Profile Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">AI Recommendations</h3>
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => <h2 className="text-2xl font-bold mt-6 mb-4 text-blue-800" {...props} />,
                        h2: ({ ...props }) => <h3 className="text-xl font-bold mt-5 mb-3 text-blue-700" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                        a: ({ ...props }) => (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {analysis.profileSummary}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;