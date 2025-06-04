import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import '../amplify-config';

interface JwtPayload {
  'custom:role'?: string;
  name?: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  allUsers: User[];
  isAuthReady: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCurrentUser = async () => {
    try {
      setError(null);
      const { signInDetails, userId } = await getCurrentUser();
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      let userRole: 'admin' | 'member' = 'member';
      let userName: string | undefined = undefined;

      if (token) {
        const payload: JwtPayload = jwtDecode(token);
        const decodedRole = payload['custom:role'];
        userRole = decodedRole === 'admin' || decodedRole === 'member' ? decodedRole : 'member';
        userName = payload.name || payload.email || signInDetails?.loginId;
      }

      const currentUser: User = {
        userId: userId,
        email: signInDetails?.loginId || '',
        role: userRole,
        name: userName,
      };

      setUser(currentUser);
      await fetchAllUsers(token);
    } catch (err: unknown) {
      console.log('No current user or session expired:', err);
      setUser(null);
      setAllUsers([]);
      setError('Failed to authenticate user');
    } finally {
      setIsAuthReady(true);
    }
  };

  const fetchAllUsers = async (token: string | undefined) => {
    if (!token) {
      setAllUsers([]);
      setError('No authentication token available');
      return;
    }
    try {
      setError(null);
      console.log('Fetching users from API...');
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      
      const data: User[] = await response.json();
      console.log('Users fetched successfully:', data.length);
      setAllUsers(data);
    } catch (err: unknown) {
      console.error('Error fetching all users:', err);
      setError('Failed to fetch users');
      setAllUsers([]);
    }
  };

  const refreshUsers = async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      await fetchAllUsers(token);
    } catch (err) {
      console.error('Error refreshing users:', err);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await amplifySignOut();
      setUser(null);
      setAllUsers([]);
    } catch (err: unknown) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  useEffect(() => {
    checkCurrentUser();
    const hubListener = (data: { payload: { event: string } }) => {
      console.log('Hub event:', data);
      if (data.payload.event === 'signedIn' || data.payload.event === 'signedOut') {
        checkCurrentUser();
      }
    };
    const removeListener = Hub.listen('auth', hubListener);
    return () => removeListener();
  }, []);

  return (
    <UserContext.Provider value={{ user, allUsers, isAuthReady, error, signOut, refreshUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};