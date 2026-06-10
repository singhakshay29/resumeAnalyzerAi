import { useInterview } from "../hooks/userInterview";
import "../interview.scss";
import { useNavigate, useParams } from "react-router";

import { useEffect, useState } from "react";
import {downloadReportPdf} from "../services/interview.api";
import Loader from "../../../components/Loader";

const Interview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("technical");
  const [openIndex, setOpenIndex] = useState(0);
  const { report, genrateReportById, loading } = useInterview();
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      genrateReportById(id);
    }
  }, [id]);

  if (loading || !report) {
    return  <Loader
    title="Preparing Your Interview Blueprint"
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
          <button className='back-btn' onClick={() => navigate(-1)}>
            ← Back to All Reports
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
