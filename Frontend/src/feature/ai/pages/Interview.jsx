import { useInterview } from "../hooks/userInterview";
import "../interview.scss";
import { useNavigate, useParams } from "react-router";

import { useEffect, useState } from "react";
import {downloadReportPdf, getInterviewJobStatus, retryInterviewJob} from "../services/interview.api";
import Loader from "../../../components/Loader";
import PreparationPlan from "../components/PreparationPlan";

const Interview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("technical");
  const [openIndex, setOpenIndex] = useState(0);
  const { report, error, genrateReportById, loading, setSavedStatus, setTaskCompleted, setReport } = useInterview();
  const [saveBusy, setSaveBusy] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [jobStatus, setJobStatus] = useState(null);
  const [jobError, setJobError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [pollVersion, setPollVersion] = useState(0);
  const { id } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return undefined;
    let cancelled = false;
    let timer;
    setJobStatus(null);
    setJobError("");
    setReport(null);
    const pollJob = async () => {
      try {
        const response = await getInterviewJobStatus(id);
        const currentStatus = response?.data;
        if (cancelled) return;
        setJobStatus(currentStatus);
        if (["queued", "processing"].includes(currentStatus?.status)) {
          timer = window.setTimeout(pollJob, 2000);
        } else if (currentStatus?.status === "completed") {
          await genrateReportById(id);
        } else if (currentStatus?.status === "failed") {
          setJobError(currentStatus.error || "Report generation failed.");
        }
      } catch (pollError) {
        if (!cancelled) {
          setJobError(pollError.response?.data?.message || "Could not check report status.");
          setJobStatus({ status: "unavailable" });
        }
      }
    };
    pollJob();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [id, genrateReportById, pollVersion, setReport]);

  const handleRetry = async () => {
    setRetrying(true);
    setJobError("");
    try {
      await retryInterviewJob(id);
      setJobStatus((current) => ({ ...current, status: "queued" }));
      setPollVersion((current) => current + 1);
    } catch (retryError) {
      setJobError(retryError.response?.data?.message || "Could not retry this report.");
    } finally {
      setRetrying(false);
    }
  };

  if (error && !loading && !report) {
    return <main className="interview-page interview-page--error"><section className="content-section"><p role="alert">{error}</p><button className="back-btn" onClick={() => navigate("/reports")}>Back to reports</button></section></main>;
  }

  if (jobStatus?.status === "unavailable") {
    return <main className="interview-page interview-page--error"><section className="content-section">
      <p role="alert">{jobError}</p>
      <button className="back-btn" onClick={() => navigate("/reports")}>Back to reports</button>
    </section></main>;
  }

  if (jobStatus?.status === "failed") {
    return <main className="interview-page interview-page--error"><section className="content-section">
      <p role="alert">{jobError || "Report generation failed."}</p>
      <button className="back-btn" disabled={retrying} onClick={handleRetry}>{retrying ? "Retrying…" : "Retry report"}</button>
      <button className="back-btn" onClick={() => navigate("/reports")}>Back to reports</button>
    </section></main>;
  }

  if (loading || !jobStatus || jobStatus.status === "queued" || jobStatus.status === "processing" || !report) {
    return  <Loader
    title={jobStatus?.status === "queued" ? "Your Report Is Queued" : "Preparing Your Interview Blueprint"}
    message="Analyzing your resume, matching skills, and generating personalized interview questions."
  />;
  }
  const downloadReport = async () => {
    try {
      const response =await downloadReportPdf(id);

      const url = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = "interview-report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  let {
    matchScore = 90,
    technicalQuestions = [],
    behaviourQuestions = [],
    skillGaps = [],
  } = report;

  const handleSaveStatus = async () => {
    setSaveBusy(true);
    setProgressError("");
    try {
      await setSavedStatus(id, !report.isSaved);
    } catch (error) {
      setProgressError(error.response?.data?.message || "Could not update saved job.");
    } finally {
      setSaveBusy(false);
    }
  };

  const handleTaskToggle = async (task) => {
    const previousKeys = report.completedTaskKeys || [];
    const key = `${task.day}:${task.taskIndex}`;
    const nextKeys = task.completed
      ? [...new Set([...previousKeys, key])]
      : previousKeys.filter((item) => item !== key);
    // Update immediately; restore the old state if the API request fails.
    setReport((current) => ({ ...current, completedTaskKeys: nextKeys }));
    setProgressError("");
    try {
      await setTaskCompleted(id, task);
    } catch (error) {
      setReport((current) => ({ ...current, completedTaskKeys: previousKeys }));
      setProgressError(error.response?.data?.message || "Could not save preparation progress.");
    }
  };

  const currentQuestions =
    activeTab === "technical" ? technicalQuestions : behaviourQuestions;

  return (
    <main className='interview-page'>
      <aside className='sidebar'>
        <h3 className='sidebar-title'>Sections</h3>

        <button
          className={`nav-btn ${activeTab === "technical" ? "active" : ""}`}
          onClick={() => setActiveTab("technical")}>
          Technical Questions
        </button>

        <button
          className={`nav-btn ${activeTab === "behaviour" ? "active" : ""}`}
          onClick={() => setActiveTab("behaviour")}>
          Behaviour Questions
        </button>
      </aside>

      <section className='content-section'>
        <div className='content-top'>
          <button className='back-btn' onClick={() => navigate("/reports")}>
            ← Back to All Reports
          </button>
          <span className="report-status" role="status">Report completed</span>
          <button className="save-job-btn" disabled={saveBusy} onClick={handleSaveStatus}>
            {saveBusy ? "Saving…" : report.isSaved ? "★ Saved job" : "☆ Save job"}
          </button>
          <button className='download-btn' onClick={downloadReport}>
            Download PDF
          </button>
        </div>
        <div className='section-header'>
          <h1>
            {activeTab === "technical"
              ? "Technical Questions"
              : "Behaviour Questions"}
          </h1>

          <span className='question-count'>
            {currentQuestions.length} questions
          </span>
        </div>

        <div className='questions-list'>
          {currentQuestions.map((item, index) => (
            <div
              key={index}
              className={`question-card ${openIndex === index ? "open" : ""}`}>
              <div
                className='question-header'
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }>
                <div className='question-left'>
                  <span className='question-number'>Q{index + 1}</span>

                  <h3>{item.question}</h3>
                </div>

                <span className='toggle-icon'>
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>

              {openIndex === index && (
                <div className='question-body'>
                  <div className='tag intention'>Intention</div>

                  <p>{item.intention}</p>

                  <div className='tag answer'>Model Answer</div>

                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {progressError && <p role="alert" className="progress-error">{progressError}</p>}
        <PreparationPlan
          plan={report.preparationPlan || []}
          completedTaskKeys={report.completedTaskKeys || []}
          onToggleTask={handleTaskToggle}
        />
      </section>

      <aside className='stats-panel'>
        <div className='score-card'>
          <h3>Match Score</h3>

          <div
            className='score-ring'
            style={{
              background: `conic-gradient( 
              #22c55e 0%,
              #22c55e ${matchScore}%,
              rgba(255,255,255,0.08) ${matchScore}%
              )`,
            }}>
            <span>{matchScore}%</span>
          </div>

          <p>Strong match for this role</p>
        </div>

        <div className='skill-gap-card'>
          <h3>Skill Gaps</h3>

          <div className='skills-list'>
            {skillGaps?.filter(Boolean)?.map((gap, index) => (
              <div
                key={index}
                className={`skill-pill ${gap.severity?.toLowerCase()}`}>
                {gap.skill}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
};

export default Interview;
