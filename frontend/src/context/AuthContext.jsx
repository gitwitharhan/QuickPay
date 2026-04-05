import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, logoutUser } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('quickpay_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    setUser(data.user);
    localStorage.setItem('quickpay_user', JSON.stringify(data.user));
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    setUser(data.user);
    localStorage.setItem('quickpay_user', JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch(err) {
      console.warn("Logout api failed, clearing local state anyway");
    } finally {
      setUser(null);
      localStorage.removeItem('quickpay_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
