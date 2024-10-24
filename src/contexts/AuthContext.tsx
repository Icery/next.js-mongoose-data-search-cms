import { createContext, ReactElement, useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserProps } from '@/domains/user';

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProps | null;
  login: (token: string, user: UserProps) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactElement }): ReactElement => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProps | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user'); // Remove user data from session storage
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
  };

  const login = (token: string, user: UserProps) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user)); // Store user data in session storage
    setIsAuthenticated(true);
    setToken(token);
    setUser(user);
    router.push(process.env.NEXT_PUBLIC_BASE_URL);
  };

  useEffect(() => {
    const tokenData: string | null = sessionStorage.getItem('token');
    const userData: string | null = sessionStorage.getItem('user');
    if (tokenData && userData) {
      setIsAuthenticated(true);
      setToken(tokenData);
      setUser(JSON.parse(userData));
    } else {
      logout();
    }
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
