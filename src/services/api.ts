import axios, { AxiosError } from "axios";
import { refreshTokens } from "./auth"; 

// const BASE_URL = import.meta.env.MODE === "development" 
//   ? "http://localhost:5000/api/v1" 
//   : "https://collab-event-backend-splt.vercel.app/api/v1";

const api = axios.create({
  baseURL: "https://collab-event-backend-splt.vercel.app/api/v1",
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register"]

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")

  const isPUblic = PUBLIC_ENDPOINTS.some((url) => config.url?.includes(url))

  if (!isPUblic && token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    if (
      error.response?.status === 401 &&
      !PUBLIC_ENDPOINTS.some((url) => originalRequest.url?.includes(url)) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const data = await refreshTokens(refreshToken)
        localStorage.setItem("accessToken", data.accessToken)

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return axios(originalRequest)
      } catch (refreshErr) {
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
        console.error(refreshErr)
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

export default api;
