// AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  const fetchUserStatus = useCallback(async () => {
    console.log(user, " user Object")
    const requestBody = {
      "is_authenticated": localStorage.getItem("is_authenticated") == "false" ? false : true
    }
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/user-status/', {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams(requestBody)
      });
      console.log("Called fetchuserStatus")
      if (response.ok) {
        const userData = await response.json();
        console.log('User Data:', user)
        setUser(userData);
        setAuthenticated(true);
        localStorage.setItem("is_authenticated", true)
      } else {
        setUser(null);
        setAuthenticated(false)
        console.error(`Erro ao obter status do usuário: ${response.status}`);
        throw new Error(`Erro ao obter status do usuário: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao obter status do usuário', error);
      setAuthenticated(false);
      setUser(null);
      // Removemos o redirecionamento aqui para permitir que a aplicação continue funcionando mesmo se não for possível verificar o status do usuário
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    setUser(null);
    clearTokens();
    router.push('/');
  };

  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const setAuthUser = (user) =>{
    setUser(user)
  }

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const value = { user, loading, logout, authenticated, fetchUserStatus, setAuthUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
