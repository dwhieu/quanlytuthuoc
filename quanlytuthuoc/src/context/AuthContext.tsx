import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username?: string | null;
  fullName?: string | null;
  login: (username?: string, fullName?: string) => void;
  loginWithToken?: (tok: string, user?: string, fullName?: string) => void;
  token?: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isLoggedIn') === 'true';
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem('username');
    } catch {
      return null;
    }
  });
  const [fullName, setFullName] = useState<string | null>(() => {
    try {
      return localStorage.getItem('fullName');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  const fetchUserInfo = async (username: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/user/${username}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.fullName) {
          localStorage.setItem('fullName', userData.fullName);
          setFullName(userData.fullName);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const login = async (user?: string, name?: string) => {
    try {
      localStorage.setItem('isLoggedIn', 'true');
      if (user) {
        localStorage.setItem('username', user);
        setUsername(user);
        // Fetch user info after successful login
        await fetchUserInfo(user);
      }
      if (name) {
        localStorage.setItem('fullName', name);
        setFullName(name);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
    setIsLoggedIn(true);
  };

  const loginWithToken = (tok: string, user?: string, name?: string) => {
    try {
      localStorage.setItem('token', tok);
      localStorage.setItem('isLoggedIn', 'true');
      if (user) localStorage.setItem('username', user);
      if (name) localStorage.setItem('fullName', name);
    } catch {}
    setToken(tok);
    setIsLoggedIn(true);
    if (user) setUsername(user);
    if (name) setFullName(name);
  };

  const logout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      // Giữ lại avatar trong localStorage để lần đăng nhập sau vẫn còn.
      // Không xóa khóa ảnh đại diện.
    } catch {}
    setIsLoggedIn(false);
    setUsername(null);
    setFullName(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, fullName, login, loginWithToken, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthProvider;
