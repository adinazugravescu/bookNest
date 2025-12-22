import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../config/keycloak';
import { UserProfile } from '../types';
import { profileService } from '../services/profileService';

interface AuthContextType {
  authenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'check-sso', checkLoginIframe: false })
      .then((authenticated) => {
        setAuthenticated(authenticated);
        if (authenticated) {
          loadUserProfile();
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        keycloak.logout();
      });
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
    setAuthenticated(false);
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUserProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

