import axios from "axios";

const api = axios.create({
    baseURL: "/api/interview",
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
      throw error;
    }
  }
  
  export async function getInterviewReportById(id) {
    try {
      const response = await api.get(`/report/${id}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching interview report:", error);
      throw error;
    }
  }
  
  export async function getAllInterviewReportsByUser() {
    try {
      const response = await api.get("/all_reports");
      return response.data;
    } catch (error) {
      console.log("Error fetching all interview reports:", error);
    throw error;
    }
  }

export async function setInterviewSavedStatus(id, saved) {
  const response = await api.patch(`/report/${id}/saved`, { saved });
  return response.data;
}

export async function setPreparationTaskCompleted(id, { day, taskIndex, completed }) {
  const response = await api.patch(`/report/${id}/preparation-progress`, {
    day,
    taskIndex,
    completed,
  });
  return response.data;
}
  
  export async function downloadReportPdf(id){
    try {
      const response = await api.get(
        `/report/${id}/download`,
        {
          responseType: "blob",
        }
      );
     return response;
    } catch (error) {
      console.error("Error downloading interview report:", error);
      throw error;
    }
  };
