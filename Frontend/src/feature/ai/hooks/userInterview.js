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
  const generateReport = async (
    resumeFile,
    selfDescription,
    jobDescription,
  ) => {
    let response = null;
    setLoading(true);
    try {
      response = await generateInterviewReport({
        resumeFile,
        selfDescription,
        jobDescription,
      });
       setReport(response?.data);
      return response?.data;
    } catch (error) {
      console.log("Error generating interview report:", error);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const genrateReportById = async (id) => {
    setLoading(true);
    let response = null;
    try {
      response = await getInterviewReportById(id);
      setReport(response?.data);
      return response?.data;
    } catch (error) {
      console.log("Error fetching interview report:", error);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const genrateReports = async () => {
    setLoading(true);
    let response = null;
    try {
      response = await getAllInterviewReportsByUser();
      setReports(response.interviewReports);
    } catch (error) {
      console.log("Error fetching interview reports:", error);
    } finally {
      setLoading(false);
    }
    return response.interviewReports;
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
