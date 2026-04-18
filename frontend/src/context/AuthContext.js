import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return {
      token: token || null,
      role: role || null,
      isAuthenticated: !!token,
    };
  });

  // Removed useEffect loading here as we now initialize state directly in useState
  useEffect(() => {
    // Sync with other tabs if needed, or leave empty
  }, []);

  // ✅ Login helper (better than directly using setAuth)
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    setAuth({
      token,
      role,
      isAuthenticated: true,
    });
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.clear(); // clears token + role

    setAuth({
      token: null,
      role: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth, // keep for flexibility
        login,   // use this ideally
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};