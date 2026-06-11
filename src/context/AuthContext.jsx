import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const VALID_EMAIL    = 'info@nextedgeforit.com';
const VALID_PASSWORD = 'Marza1@34';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('ne_user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(email, password) {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      const userData = { email, name: 'NextEdge Admin', role: 'Administrator' };
      setUser(userData);
      sessionStorage.setItem('ne_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem('ne_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
