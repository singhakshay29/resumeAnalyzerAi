import axios from "axios";

const api = axios.create({
    baseURL: "https://resume-analyzer-ai-backend.vercel.app/api/interview",
    withCredentials: true,
  });
  
  export async function generateInterviewReport({ resumeFile, selfDescription, jobDescription }) {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("selfDescription", selfDescription);
    formData.append("jobDescription", jobDescription);
  
    try {
      const response = await api.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.log("Error generating interview report:", error);
      return null;
    }
  }
  
  export async function getInterviewReportById(id) {
    try {
      const response = await api.get(`/report/${id}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching interview report:", error);
      return null;
    }
  }
  
  export async function getAllInterviewReportsByUser() {
    try {
      const response = await api.get("/all_reports");
      return response.data;
    } catch (error) {
      console.log("Error fetching all interview reports:", error);
      return null;
    }
  }