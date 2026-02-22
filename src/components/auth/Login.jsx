import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fraudAlert, setFraudAlert] = useState(null);
  const [message, setMessage] = useState('');
  const [newDevice, setNewDevice] = useState(false);

  // CAPTCHA state
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { email, password };
      if (captchaRequired) {
        payload.captchaToken = captchaToken;
        payload.captchaAnswer = captchaAnswer;
      }

      const response = await authService.login(payload);
      
      // Check if MFA is required (new device or fraud detected)
      if (response.requiresMFA) {
        setUserId(response.userId);
        setFraudAlert(response.fraudAlert);
        setMessage(response.message || 'Enter the 6-digit code sent to your email');
        setNewDevice(response.newDevice || false);
        setStep(2);
      } else {
        // Trusted device - login successful, no OTP needed
        login(response.user, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
        navigate('/dashboard');
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Login failed');

      // Handle CAPTCHA challenge from backend
      if (data?.requiresCaptcha) {
        setCaptchaRequired(true);
        setCaptchaQuestion(data.captchaQuestion || '');
        setCaptchaToken(data.captchaToken || '');
        setCaptchaAnswer(''); // reset previous answer
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyMFA({ userId, otp });
      login(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Sign in to your account' : 'Verify your identity'}
          </h2>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {captchaRequired && (
              <div className="rounded-md bg-orange-50 border border-orange-200 p-4">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-orange-800">Security Check Required</span>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Multiple failed attempts detected. Please solve the CAPTCHA to continue.
                </p>
                <label className="block text-sm font-medium text-orange-800 mb-1">
                  What is {captchaQuestion} = ?
                </label>
                <input
                  type="number"
                  required={captchaRequired}
                  className="appearance-none relative block w-32 px-3 py-2 border border-orange-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Answer"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyMFA}>
            {newDevice && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>New device detected.</strong> For your security, please verify your identity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {fraudAlert && (
              <div className="rounded-md bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800">{fraudAlert.message}</p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {fraudAlert.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-4">
                {message || 'Enter the 6-digit code sent to your email'}
              </p>
              <input
                type="text"
                required
                maxLength={6}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
