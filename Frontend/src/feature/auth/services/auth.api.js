import axios from "axios";

const api = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});
export async function registerUser({ userName, email, password }) {
  try {
    const response = await api.post("/register", {
      userName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log("Error registering user:", error);
    throw error;
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
    throw error;
  }
}

export async function logoutUser() {
  try {
    const response = await api.get("/logout");
    return response.data;
  } catch (error) {
    console.log("Error logging out user:", error);
    throw error;
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