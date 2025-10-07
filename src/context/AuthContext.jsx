



import React, { createContext, useContext, useState, useEffect } from 'react';
import http from '../api/httpClient';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log("Component rendering");
  const backendUrl = import.meta.env.VITE_BACKEND_URL2;
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [credits, setCredits] = useState(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const { getToken } = useClerkAuth();
  // const navigate = useNavigate();

  const loadUserCredits = async () => {
    if (!isSignedIn || !user) {
      setCredits(0);
      return;
    }

    try {
      setIsLoadingCredits(true);
      // Use getToken from useAuth instead of user.getToken
      const token = await getToken();

      const response = await http.get(`/api/v1/resume/credits`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // withCredentials: true // Ensure credentials are sent with the request
      });
      if (response.data.success) {
        setCredits(response.data.data.credits);
        console.log('User credits fetched successfully:', response.data.data.credits);
      } else {
        toast.error('Failed to fetch user credits in try');
        console.error('Fetch error:', response.data.message);
      }
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      toast.error(`Failed to fetch credits: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  // In AuthContext.jsx
  const deductCredit = async (serviceType) => {
    if (!isSignedIn || !user) {
      openSignIn();
      toast.error('Please sign in to use this service');
      throw new Error('Please sign in to use this service');
    }
    try {
      // Use getToken from useClerkAuth instead of user.getToken
      const token = await getToken();
      const response = await http.post(
        `/api/v1/resume/users/deduct-credit`,
        { serviceType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Deducting credit for service type:', serviceType);
      if (response.data.success) {
        setCredits(response.data.data.credits);
        return true;
      } else {
        toast.error(response.data.message || 'Failed to deduct credit');
        return false;
      }
    } catch (error) {
      toast.error('Failed to deduct credit');
      console.error('Error deducting credit:', error);
      return false;
    }
  };
  useEffect(() => {
    console.log('useEffect triggered');
    if (isSignedIn && user) {
      console.log('User is signed in:', user.email);
      loadUserCredits();
    }
  }, [isSignedIn, user]);

  const contextValue = {
    backendUrl,
    credits,
    getToken,
    isLoadingCredits,
    loadUserCredits,
    deductCredit,
    isSignedIn,
    requireAuth: (action) => {
      if (!isSignedIn) {
        toast.error(`Please sign in to ${action}`);
        openSignIn();
        return false;
      }
      return true;
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);