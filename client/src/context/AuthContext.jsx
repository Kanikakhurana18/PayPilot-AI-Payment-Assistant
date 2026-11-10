import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = "http://localhost:8000/api";

const savedToken = localStorage.getItem("paypilot-token");

if (savedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
} else {
  delete axios.defaults.headers.common["Authorization"];
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("paypilot-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("paypilot-token")
  );

  const saveAuthData = (data) => {
    localStorage.setItem("paypilot-token", data.token);
    localStorage.setItem("paypilot-user", JSON.stringify(data.user));

    axios.defaults.headers.common["Authorization"] =
      `Bearer ${data.token}`;

    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (formData) => {
    const response = await axios.post(
      `${API_URL}/auth/signup`,
      formData
    );

    saveAuthData(response.data);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      credentials
    );

    saveAuthData(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("paypilot-token");
    localStorage.removeItem("paypilot-user");

    delete axios.defaults.headers.common["Authorization"];

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
