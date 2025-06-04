import React, { useState } from 'react';
import { signIn, fetchAuthSession, getCurrentUser, resendSignUpCode, confirmSignUp } from 'aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import LoginStyles from './Login.module.css';
import Signup from './Signup';
import VerifySignup from './VerifySignup';

interface JwtPayload {
  'custom:role'?: string;
  email?: string;
}

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { error: contextError, signOut } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const signInOutput = await signIn({ username: email, password });

      // Check if sign-in is complete or requires additional steps
      if (!signInOutput.isSignedIn) {
        if (signInOutput.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          // User needs to verify their email
          try {
            await resendSignUpCode({ username: email });
            setShowVerification(true);
            return;
          } catch (resendErr: any) {
            throw new Error(`Failed to send verification code: ${resendErr.message}`);
          }
        } else if (signInOutput.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
          throw new Error('MFA required. Please check your SMS for the code.');
        } else {
          throw new Error(`Additional sign-in step required: ${signInOutput.nextStep.signInStep}`);
        }
      }

      // Get user details after successful sign-in
      const { userId, signInDetails } = await getCurrentUser();
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      let userRole: 'admin' | 'member' = 'member';
      if (token) {
        const payload: JwtPayload = jwtDecode(token);
        const decodedRole = payload['custom:role'];
        if (decodedRole === 'admin' || decodedRole === 'member') {
          userRole = decodedRole;
        } else {
          userRole = 'member';
        }
      }

      // Send user profile to backend
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          email,
          role: userRole,
          name: email,
          lastLogin: Date.now(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user profile');
      }

      const user: User = {
        uid: userId,
        email: signInDetails?.loginId || email,
        role: userRole,
        name: email,
      };

      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Auth Error:', err);
      
      // Handle UserNotConfirmedException specifically
      if (err.name === 'UserNotConfirmedException' || 
          (err.message && err.message.includes('User is not confirmed'))) {
        try {
          await resendSignUpCode({ username: email });
          setShowVerification(true);
          return;
        } catch (resendErr: any) {
          setError(`Failed to send verification code: ${resendErr.message}`);
        }
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
        if (err.code === 'UserUnAuthenticatedException') {
          await signOut();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <VerifySignup 
        email={email} 
        onSuccess={() => {
          setShowVerification(false);
          setError('Verification successful! Please log in again.');
        }} 
        onBack={() => setShowVerification(false)} 
      />
    );
  }

  if (showSignup) return <Signup onSuccess={() => setShowSignup(false)} />;

  return (
    <div className={LoginStyles.container}>
      <div className={LoginStyles.card}>
        <h2 className={LoginStyles.title}>Welcome Back!</h2>
        <p className={LoginStyles.subtitle}>Sign in to your account</p>

        {(error || contextError) && (
          <p className={LoginStyles.error}>{error || contextError}</p>
        )}

        <div className={LoginStyles.inputGroup}>
          <input
            className={LoginStyles.input}
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={LoginStyles.inputGroup}>
          <input
            className={LoginStyles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className={LoginStyles.button}
          onClick={handleSubmit}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <svg
              className={LoginStyles.spinner}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>

        <p className={LoginStyles.signupText}>
          Don't have an account?{' '}
          <button
            className={LoginStyles.signupButton}
            onClick={() => setShowSignup(true)}
            disabled={loading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;