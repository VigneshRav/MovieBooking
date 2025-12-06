import React, { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Film,
  Popcorn,
  Clapperboard,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginStyles } from "../../assets/dummyStyles";

// API base (points to /api/auth)
const API_BASE = "https://moviebooking-backend-vo9q.onrender.com/api/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 6) {
      toast.error("⚠️ Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const res = await axios.post(`${API_BASE}/login`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const data = res.data;

      if (data && data.success) {
        toast.success(data.message || "🎬 Login successful! Redirecting...");

        // Save token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Save user info
        const userToStore = data.user || { email: formData.email };

        localStorage.setItem("user", JSON.stringify(userToStore));
        localStorage.setItem("cine_auth", JSON.stringify({ isLoggedIn: true }));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem(
          "userEmail",
          userToStore.email || formData.email || ""
        );

        // Identify admin users
        const isAdmin =
          userToStore.role === "admin" || userToStore.isAdmin === true;

        // REDIRECT BASED ON ROLE
        setTimeout(() => {
          if (isAdmin) {
            window.location.href = "https://movie-booking-admin.netlify.app";
          } else {
            window.location.href = "/";
          }
        }, 1000);

        return;
      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const serverMsg =
        err?.response?.data?.message || err?.message || "Server error";
      toast.error(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    window.location.href = "/";
  };

  return (
    <div className={loginStyles.pageContainer}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="relative w-full max-w-md z-10">
        <div className={loginStyles.backButtonContainer}>
          <button
            onClick={goBack}
            className={loginStyles.backButton}
            aria-label="Back to Home"
          >
            <ArrowLeft size={20} className={loginStyles.backButtonIcon} />
            <span className={loginStyles.backButtonText}>Back to Home</span>
          </button>
        </div>

        <div className={loginStyles.cardContainer}>
          <div className={loginStyles.cardHeader}></div>

          <div className={loginStyles.cardContent}>
            <div className={loginStyles.headerContainer}>
              <div className={loginStyles.headerIconContainer}>
                <Film className={loginStyles.headerIcon} size={28} />
                <h2 className={loginStyles.headerTitle}>CINEMA ACCESS</h2>
              </div>
              <p className={loginStyles.headerSubtitle}>
                Enter your credentials to continue the experience
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={loginStyles.inputGroup}>
                <label htmlFor="email" className={loginStyles.label}>
                  EMAIL ADDRESS
                </label>
                <div className={loginStyles.inputContainer}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={loginStyles.input}
                    placeholder="Enter your email"
                    aria-label="Email address"
                  />
                  <div className={loginStyles.inputIcon}>
                    <Clapperboard size={16} className="text-red-400" />
                  </div>
                </div>
              </div>

              <div className={loginStyles.inputGroup}>
                <label htmlFor="password" className={loginStyles.label}>
                  PASSWORD
                </label>
                <div className={loginStyles.inputContainer}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={loginStyles.inputWithIcon}
                    placeholder="Enter your password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    className={loginStyles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        className={loginStyles.passwordToggleIcon}
                      />
                    ) : (
                      <Eye
                        size={18}
                        className={loginStyles.passwordToggleIcon}
                      />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`${loginStyles.submitButton} ${
                  isLoading ? loginStyles.submitButtonDisabled : ""
                }`}
                aria-disabled={isLoading}
              >
                {isLoading ? (
                  <div className={loginStyles.buttonContent}>
                    <div className={loginStyles.loadingSpinner} />
                    <span className={loginStyles.buttonText}>
                      SIGNING IN...
                    </span>
                  </div>
                ) : (
                  <div className={loginStyles.buttonContent}>
                    <Popcorn size={18} className={loginStyles.buttonIcon} />
                    <span className={loginStyles.buttonText}>
                      ACCESS YOUR ACCOUNT
                    </span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className={loginStyles.footerContainer}>
          <p className={loginStyles.footerText}>
            Don't have an account?{" "}
            <a href="/signup" className={loginStyles.footerLink}>
              Create one now
            </a>
          </p>
        </div>
      </div>

      <style>{loginStyles.customCSS}</style>
    </div>
  );
};

export default LoginPage;
