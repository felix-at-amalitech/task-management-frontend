import React, { useState } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import SignupStyles from './Signup.module.css';

interface VerifySignupProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const VerifySignup: React.FC<VerifySignupProps> = ({ email, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      if (isSignUpComplete) {
        alert('Email verification successful! You can now log in.');
        onSuccess();
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during verification';
      console.error('Verification Error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(null);
    
    try {
      await resendSignUpCode({ username: email });
      alert('A new verification code has been sent to your email.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification code';
      console.error('Resend Code Error:', err);
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={SignupStyles.container}>
      <div className={SignupStyles.card}>
        <h2 className={SignupStyles.title}>Verify Your Email</h2>
        <p className={SignupStyles.subtitle}>Enter the verification code sent to {email}</p>

        {error && <p className={SignupStyles.error}>{error}</p>}

        <div className={SignupStyles.inputGroup}>
          <input
            className={SignupStyles.input}
            placeholder="Verification Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className={SignupStyles.button}
          onClick={handleVerify}
          disabled={loading || !code}
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
            'Verify'
          )}
        </button>

        <div className={SignupStyles.loginText}>
          <button
            className={SignupStyles.loginButton}
            onClick={handleResendCode}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
          {' | '}
          <button
            className={SignupStyles.loginButton}
            onClick={onBack}
            disabled={loading || resending}
          >
            Back to signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifySignup;