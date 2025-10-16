import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username?: string | null;
  login: (username?: string) => void;
  loginWithToken?: (tok: string, user?: string) => void;
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
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  const login = (user?: string) => {
    try {
      localStorage.setItem('isLoggedIn', 'true');
      if (user) localStorage.setItem('username', user);
    } catch {}
    setIsLoggedIn(true);
    if (user) setUsername(user);
  };

  const loginWithToken = (tok: string, user?: string) => {
    try {
      localStorage.setItem('token', tok);
      localStorage.setItem('isLoggedIn', 'true');
      if (user) localStorage.setItem('username', user);
    } catch {}
    setToken(tok);
    setIsLoggedIn(true);
    if (user) setUsername(user);
  };

  const logout = () => {
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
    } catch {}
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, loginWithToken, token, logout }}>
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
