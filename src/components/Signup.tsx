import React, { useState } from 'react';
import { signUp, resendSignUpCode } from 'aws-amplify/auth';
import SignupStyles from './Signup.module.css';
import VerifySignup from './VerifySignup';

interface SignupProps {
  onSuccess: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic password validation (e.g., minimum length)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:role': 'member', // Hardcode to 'member' for security
          },
        },
      });

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setShowVerification(true);
      } else {
        setError('Unexpected signup step. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup Error:', err);
      
      // Handle case where user exists but is not verified
      if (err.name === 'UsernameExistsException' || 
          (err.message && err.message.includes('User already exists'))) {
        try {
          // Attempt to resend the verification code
          await resendSignUpCode({ username: email });
          setShowVerification(true);
          setError(null);
        } catch (resendErr: any) {
          setError(`Failed to resend verification code: ${resendErr.message}`);
        }
      } else {
        setError(err.message || 'An unexpected error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <VerifySignup 
        email={email} 
        onSuccess={onSuccess} 
        onBack={() => setShowVerification(false)} 
      />
    );
  }

  return (
    <div className={SignupStyles.container}>
      <div className={SignupStyles.card}>
        <h2 className={SignupStyles.title}>Create an Account</h2>
        <p className={SignupStyles.subtitle}>Join us to manage your tasks!</p>

        {error && <p className={SignupStyles.error}>{error}</p>}

        <div className={SignupStyles.inputGroup}>
          <input
            className={SignupStyles.input}
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className={SignupStyles.inputGroup}>
          <input
            className={SignupStyles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className={SignupStyles.button}
          onClick={handleSignup}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <svg
              className={SignupStyles.spinner}
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
            'Sign Up'
          )}
        </button>

        <p className={SignupStyles.loginText}>
          Already have an account?{' '}
          <button
            className={SignupStyles.loginButton}
            onClick={onSuccess}
            disabled={loading}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;