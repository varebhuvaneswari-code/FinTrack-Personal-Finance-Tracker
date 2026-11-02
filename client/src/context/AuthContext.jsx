
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
