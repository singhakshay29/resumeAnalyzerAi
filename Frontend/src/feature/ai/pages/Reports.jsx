import { useEffect, useState } from "react";
import { getAllInterviewReportsByUser } from "../services/interview.api";
import "../reports.scss";
import {useNavigate} from "react-router";

const Reports = () => {
    const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const handleGenerteReport = async (_id) => {
    navigate(`/interview/${_id}`);
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getAllInterviewReportsByUser();
        setReports(data.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className='reports-loading'>Loading...</div>;
  }

  if (reports.length === 0) {
    return <div className='reports-empty'>No reports found.</div>;
  }

  return (
    <div className='reports-page'>
      <div className='reports-header'>
        <span className='tag'>Interview Reports</span>
        <h1>
          Your Generated <span>Reports</span>
        </h1>
        <p>
          Review your previous resume analyses and interview preparation
          reports.
        </p>
      </div>

      <div className='reports-grid'>
        {reports?.map((report, index) => (
          <div key={index} className='report-card'>
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
              <button onClick={()=>handleGenerteReport(report?._id)} className='view-report-btn'>View Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
