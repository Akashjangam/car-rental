import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid stored user");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const loggedInUser = response.data.user;

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed",
      };
    }
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password,
        }
      );

      const token = response.data.token;
      const registeredUser = response.data.user;

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      setUser(registeredUser);

      return {
        success: true,
        user: registeredUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed",
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// USE AUTH
// =========================

export const useAuth = () => {
  return useContext(AuthContext);
};