import { useContext } from "react";
import { InterviewContext } from "../interview.context";
import {
  generateInterviewReport,
  getAllInterviewReportsByUser,
  getInterviewReportById,
} from "../services/interview.api";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  const { loading, report, reports, setLoading, setReport, setReports } =
    context;
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  const generateReport = async ({
    resumeFile,
    selfDescription,
    jobDescription,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        resumeFile,
        selfDescription,
        jobDescription,
      });
      setReport(response.interviewReport);
    } catch (error) {
      console.log("Error generating interview report:", error);
    } finally {
      setLoading(false);
    }
  };

  const genrateReportById = async (id) => {
    setLoading(true);
    try {
      const response = await getInterviewReportById(id);
      setReport(response.interviewReport);
    } catch (error) {
      console.log("Error fetching interview report:", error);
    } finally {
      setLoading(false);
    }
  };

  const genrateReports = async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReportsByUser();
      setReports(response.interviewReports);
    } catch (error) {
      console.log("Error fetching interview reports:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    report,
    reports,
    generateReport,
    genrateReportById,
    genrateReports,
  };
};
