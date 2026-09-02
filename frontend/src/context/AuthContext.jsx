import { createContext, useContext, useEffect, useState } from "react";

import { registerUser, loginUser, getProfile } from "../services/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD USER FROM EXISTING TOKEN
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const storedToken = localStorage.getItem("token");

      // No token
      if (!storedToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const response = await getProfile(storedToken);

        /*
          Backend normally returns:

          {
            success: true,
            user: {
              _id,
              name,
              email,
              role
            }
          }
        */

        const userData =
          response?.user || response?.data?.user || response?.data || null;

        if (!userData || !userData._id) {
          throw new Error("Invalid user profile received");
        }

        if (!mounted) return;

        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error("Failed to restore authentication:", error);

        /*
          Only remove the token when the server
          explicitly says the authentication token
          is invalid/unauthorized.

          This prevents accidental logout because
          of temporary server/network errors.
        */

        const status = error?.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");

          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } else {
          /*
            Keep the token if the problem is not
            an authentication error.
          */

          if (mounted) {
            setToken(storedToken);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // REGISTER
  // =========================================================

  const register = async (userData) => {
    const response = await registerUser(userData);

    return response;
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const login = async (loginData) => {
    const response = await loginUser(loginData);

    /*
      Support:

      {
        token: "...",
        user: {...}
      }

      or

      {
        data: {
          token: "...",
          user: {...}
        }
      }
    */

    const newToken = response?.token || response?.data?.token;

    const userData = response?.user || response?.data?.user || null;

    if (!newToken) {
      throw new Error("Login failed: token not received.");
    }

    // Save token permanently
    localStorage.setItem("token", newToken);

    // Update state
    setToken(newToken);

    // If login already returned user
    if (userData?._id) {
      setUser(userData);
    } else {
      /*
        Otherwise fetch profile
      */

      try {
        const profileResponse = await getProfile(newToken);

        const profileUser =
          profileResponse?.user ||
          profileResponse?.data?.user ||
          profileResponse?.data ||
          null;

        if (!profileUser?._id) {
          throw new Error("Invalid profile received after login.");
        }

        setUser(profileUser);
      } catch (error) {
        console.error("Failed to load profile after login:", error);

        /*
          Login itself succeeded and token exists.
          Do not immediately delete the token here.
        */

        setUser(null);
      }
    }

    return response;
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  // =========================================================
  // AUTH VALUE
  // =========================================================

  const value = {
    user,
    setUser,

    token,
    setToken,

    loading,

    register,
    login,
    logout,

    isAuthenticated: Boolean(user && token),

    isAdmin: user?.role === "admin",

    isDealer: user?.role === "dealer",

    isUser: user?.role === "user",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =========================================================
// USE AUTH
// =========================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;
