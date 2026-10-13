import { useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context";
import {
  generateInterviewReport,
  getAllInterviewReportsByUser,
  getInterviewReportById,
  setInterviewSavedStatus,
  setPreparationTaskCompleted,
} from "../services/interview.api";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }
  const { loading, report, reports, setLoading, setReport, setReports, error, setError } = context;
  const generateReport = async (
    resumeFile,
    selfDescription,
    jobDescription,
  ) => {
    setError("");
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        resumeFile,
        selfDescription,
        jobDescription,
      });
       setReport(response?.data);
      return response?.data;
    } catch (error) {
      console.log("Error generating interview report:", error);
      setError(error.response?.data?.message || "Could not generate the report. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const genrateReportById = useCallback(async (id) => {
    setError("");
    setLoading(true);
    let response = null;
    try {
      response = await getInterviewReportById(id);
      setReport(response?.data);
      return response?.data;
    } catch (error) {
      console.log("Error fetching interview report:", error);
      setError(error.response?.data?.message || "Could not load this report.");
      return response;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setReport]);

  const genrateReports = async () => {
    setError("");
    setLoading(true);
    let response = null;
    try {
      response = await getAllInterviewReportsByUser();
      setReports(response?.data || []);
    } catch (error) {
      console.log("Error fetching interview reports:", error);
      setError(error.response?.data?.message || "Could not load reports.");
    } finally {
      setLoading(false);
    }
    return response?.data || [];
  };

  const setSavedStatus = async (id, saved) => {
    const response = await setInterviewSavedStatus(id, saved);
    const savedStatus = response?.data?.isSaved;
    if (typeof savedStatus !== "boolean") {
      throw new Error("The saved-job response did not include the updated status.");
    }
    setReport((current) => current?._id === id ? { ...current, isSaved: savedStatus } : current);
    setReports((current) => current.map((item) => item._id === id ? { ...item, isSaved: savedStatus } : item));
    return response.data;
  };

  const setTaskCompleted = async (id, task) => {
    const response = await setPreparationTaskCompleted(id, task);
    setReport((current) => current?._id === id ? { ...current, completedTaskKeys: response.data.completedTaskKeys } : current);
    return response.data;
  };

  return {
    loading,
    report,
    reports,
    error,
    clearError: () => setError(""),
    setReport,
    generateReport,
    genrateReportById,
    genrateReports,
    setSavedStatus,
    setTaskCompleted,
  };
};
