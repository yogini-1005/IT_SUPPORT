import React, { useState } from "react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import AuthIllustration from "../assets/images/auth-illustration.png";
import "../assets/styles/RegisterLogin.css";
// import { GoogleLogin } from 'react-google-login';
// import GitHubLogin from 'react-github-login';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", formData);
      const token = res.data.token;
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      toast.success("Login successful");
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "agent") {
        navigate("/agent-panel");
      } else {
        navigate("/my-tickets");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleSuccess = async (response) => {
  //   try {
  //     const res = await axios.post("/auth/google", {
  //       token: response.tokenId,
  //     });
  //     handleAuthSuccess(res.data.token);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Google login failed");
  //   }
  // };

  // const handleGoogleFailure = (error) => {
  //   toast.error("Google login failed");
  //   console.error(error);
  // };

  // const handleGitHubSuccess = async (response) => {
  //   try {
  //     const res = await axios.post("/auth/github", {
  //       code: response.code,
  //     });
  //     handleAuthSuccess(res.data.token);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "GitHub login failed");
  //   }
  // };

  // const handleGitHubFailure = (error) => {
  //   toast.error("GitHub login failed");
  //   console.error(error);
  // };

  // const handleAuthSuccess = (token) => {
  //   localStorage.setItem("token", token);
  //   const decoded = jwtDecode(token);
  //   const userRole = decoded.role;

  //   toast.success("Login successful");
  //   if (userRole === "admin") {
  //     navigate("/admin");
  //   } else if (userRole === "agent") {
  //     navigate("/agent-panel");
  //   } else {
  //     navigate("/my-tickets");
  //   }
  // };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <div className="auth-illustration">
              <img src={AuthIllustration} alt="Authentication" />
            </div>
            <div className="auth-welcome">
              <h2>Welcome back to SupportHub</h2>
              <p>
                Log in to manage your support tickets and get help from our team
              </p>
            </div>
            <div className="auth-features">
              <div className="auth-feature">
                <FiCheck /> 24/7 Customer Support
              </div>
              <div className="auth-feature">
                <FiCheck /> Fast Response Times
              </div>
              <div className="auth-feature">
                <FiCheck /> Secure Ticket Management
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Sign In</h1>
              <p>Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div
                className={`form-group ${errors.password ? "has-error" : ""}`}
              >
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
                <div className="form-options">
                  <div className="remember-me">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-password">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Sign In <FiArrowRight className="button-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-auth-buttons">
              <button className="social-button google">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.152-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.61-0.056-1.229-0.158-1.821h-9.842z"></path>
                </svg>
                Google
              </button>
              <button className="social-button github">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
                GitHub
              </button>
            </div>
            {/* <div className="social-auth-buttons">
              <GoogleLogin
                clientId="YOUR_GOOGLE_CLIENT_ID"
                buttonText="Google"
                onSuccess={handleGoogleSuccess}
                onFailure={handleGoogleFailure}
                cookiePolicy={"single_host_origin"}
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="social-button google"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.152-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.61-0.056-1.229-0.158-1.821h-9.842z"></path>
                    </svg>
                    Google
                  </button>
                )}
              />

              <GitHubLogin
                clientId="YOUR_GITHUB_CLIENT_ID"
                redirectUri="YOUR_REDIRECT_URI"
                onSuccess={handleGitHubSuccess}
                onError={handleGitHubFailure}
                render={({ onClick }) => (
                  <button onClick={onClick} className="social-button github">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                    </svg>
                    GitHub
                  </button>
                )}
              />
            </div> */}

            <div className="auth-footer">
              <p className="auth-switch">
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
