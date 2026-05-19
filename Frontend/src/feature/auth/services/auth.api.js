import axios from "axios";

const api = axios.create({
  baseURL: "https://resume-analyzer-ai-backend.vercel.app/api/auth",
  withCredentials: true,
});
export async function registerUser({ userName, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      userName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log("Error registering user:", error);
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await api.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log("Error logging in user:", error);
  }
}

export async function logoutUser() {
  try {
    const response = await api.get("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.log("Error logging out user:", error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/getuserInfo");
    return response.data;
  } catch (error) {
    console.log("Error fetching current user:", error);
  }
}
