import axios from "axios";

const BASE_URL = "http://localhost:8080/api";
const API = axios.create({ baseURL: BASE_URL });

// ---------- Session helpers ----------
export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const getRefreshToken = () =>
  localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

export const getUser = () => {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

// Use the same storage that already holds the session
const getActiveStorage = () =>
  localStorage.getItem("refreshToken") ? localStorage : sessionStorage;

export const saveSession = (data, remember) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", data.token);
  if (data.refreshToken) {
    storage.setItem("refreshToken", data.refreshToken);
  }
  storage.setItem(
    "user",
    JSON.stringify({
      userId: data.userId,
      username: data.username,
      email: data.email,
      role: data.role,
    })
  );
};

export const logout = () => {
  ["token", "refreshToken", "user"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

// Revoke the refresh token on the server, then clear local data
export const logoutUser = async () => {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await axios.post(`${BASE_URL}/auth/logout`, { refreshToken });
    }
  } catch (e) {
    // ignore: the local session is cleared either way
  } finally {
    logout();
  }
};

// ---------- Interceptors ----------
// Attach the access token to every request
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uses plain axios (not API) so the interceptor cannot loop
const refreshSession = async () => {
  const storage = getActiveStorage();
  const refreshToken = getRefreshToken();
  const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  storage.setItem("token", res.data.token);
  storage.setItem("refreshToken", res.data.refreshToken);
  return res.data.token;
};

let refreshing = null; // shared, so parallel 401s trigger only one refresh

// On 401 from a protected endpoint: refresh once, retry, else go to login
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = original?.url || "";

    if (error.response?.status === 401 && !url.includes("/auth/") && !original._retry) {
      original._retry = true;
      try {
        refreshing = refreshing || refreshSession().finally(() => (refreshing = null));
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return API(original);
      } catch (e) {
        logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Auth ----------
export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await API.post("/auth/register", payload);
  return response.data;
};

// ---------- Current user ----------
export const getProfile = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await API.put("/users/me/password", { currentPassword, newPassword });
  return response.data;
};

// ---------- Admin ----------
export const getAdminStats = async () => {
  const response = await API.get("/admin/stats");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await API.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};