import { useEffect, useState } from "react";
import { getAllInterviewReportsByUser } from "../services/interview.api";
import "../reports.scss";
import {useNavigate} from "react-router";
import Loader from "../../../components/Loader";
import ReportComparison from "../components/ReportComparison";
import { setInterviewSavedStatus } from "../services/interview.api";

const Reports = () => {
    const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingIds, setSavingIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const visibleReports = reports.filter((report) => !savedOnly || report.isSaved);
  const selectedReports = reports.filter((report) => selectedIds.includes(report._id));
  
  const handleGenerteReport = async (_id) => {
    navigate(`/interview/${_id}`);
  };

  const toggleSaved = async (report) => {
    const saved = !report.isSaved;
    setSavingIds((current) => [...current, report._id]);
    setErrorMessage("");
    try {
      const response = await setInterviewSavedStatus(report._id, saved);
      const savedStatus = response?.data?.isSaved;
      if (typeof savedStatus !== "boolean") {
        throw new Error("The API deployment returned an unexpected response. Its /api routes must point to the Backend project.");
      }
      setReports((current) => current.map((item) => item._id === report._id
        ? { ...item, isSaved: savedStatus }
        : item));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || "Could not update saved job. Please retry.");
    } finally {
      setSavingIds((current) => current.filter((id) => id !== report._id));
    }
  };

  const toggleCompare = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllInterviewReportsByUser();
        setReports(Array.isArray(data?.data) ? data.data.filter(Boolean) : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setErrorMessage("Could not load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return  <Loader
    title="Loading Reports"
    message="Fetching your generated interview reports."
  />
  }

  if (reports.length === 0) {
    return (
      <main className="reports-page reports-page--empty">
        <div className="reports-toolbar">
          <button type="button" className="back-home-btn" onClick={() => navigate("/")}>
            <span aria-hidden="true">←</span> Back to home
          </button>
        </div>
        <section role={errorMessage ? "alert" : undefined} className="reports-empty-state">
          <span className="empty-state-icon" aria-hidden="true">✦</span>
          <h2>{errorMessage ? "Reports are unavailable" : "No reports yet"}</h2>
          <p>{errorMessage || "Create your first interview report to start tracking your progress."}</p>
          {!errorMessage && <button type="button" className="view-report-btn" onClick={() => navigate("/")}>Create a report</button>}
        </section>
      </main>
    );
  }

  return (
    <div className='reports-page'>
      <div className="reports-toolbar">
        <button type="button" className="back-home-btn" onClick={() => navigate("/")}>
          <span aria-hidden="true">←</span> Back to home
        </button>
      </div>
      <div className='reports-header'>
        <span className='tag'>Interview Reports</span>
        <h1>
          Your Generated <span>Reports</span>
        </h1>
        <p>
          Review your previous resume analyses and interview preparation
          reports.
        </p>
        <div className="reports-actions">
          <button type="button" className={!savedOnly ? "filter-btn active" : "filter-btn"} onClick={() => setSavedOnly(false)}>
            All reports ({reports.length})
          </button>
          <button type="button" className={savedOnly ? "filter-btn active" : "filter-btn"} onClick={() => setSavedOnly(true)}>
            Saved jobs ({reports.filter((report) => report.isSaved).length})
          </button>
          <span>Select up to 3 reports to compare progress.</span>
        </div>
      </div>

      {errorMessage && <p role="alert" className="reports-error">{errorMessage}</p>}

      <ReportComparison reports={selectedReports} onClose={() => setSelectedIds([])} />

      <div className='reports-grid'>
        {visibleReports?.map((report) => (
          <div key={report._id} className='report-card'>
            <div className='report-card-header'>
              <div>
                <h3>{report.title}</h3>
                <p className='report-date'>
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div
                className={`score-badge ${
                  report.matchScore >= 80
                    ? "excellent"
                    : report.matchScore >= 60
                    ? "good"
                    : "average"
                }`}>
                {report.matchScore}%
              </div>
            </div>

            <div className='report-stats'>
              <div className='stat'>
                <span>Technical</span>
                <strong>{report.technicalQuestions?.length}</strong>
              </div>

              <div className='stat'>
                <span>Behavioral</span>
                <strong>{report.behaviourQuestions?.length}</strong>
              </div>

              <div className='stat'>
                <span>Plan</span>
                <strong>{report.preparationPlan?.length} Days</strong>
              </div>
            </div>

            <div className='report-footer'>
              <div className="report-card-actions">
                <button
                  type="button"
                  className="save-job-btn"
                  disabled={savingIds.includes(report._id)}
                  onClick={() => toggleSaved(report)}
                >
                  {savingIds.includes(report._id) ? "Saving…" : report.isSaved ? "★ Saved job" : "☆ Save job"}
                </button>
                <label className="compare-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(report._id)}
                    disabled={selectedIds.length >= 3 && !selectedIds.includes(report._id)}
                    onChange={() => toggleCompare(report._id)}
                  />
                  Compare
                </label>
              </div>
              <button onClick={()=>handleGenerteReport(report?._id)} className='view-report-btn'>View Report</button>
            </div>
          </div>
        ))}
      </div>
      {savedOnly && visibleReports.length === 0 && <p className="reports-empty">No saved jobs yet. Save a report to track it here.</p>}
    </div>
  );
};

export default Reports;
