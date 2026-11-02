
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Wallet, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      // Save authentication details
      login(response.data.user, response.data.token);

      setMessage("Login successful!");

      navigate("/dashboard");

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="brand">
          <div className="brand-icon">
            <Wallet size={28} />
          </div>
          <h2>FinTrack</h2>
        </div>

        <h1>Welcome back!</h1>
        <p className="subtitle">
          Manage your money smarter, every day.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <div className="input-box">
            <Mail size={19} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="input-box">
            <Lock size={19} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot">
            <span>Forgot password?</span>
          </div>

          {message && (
            <p style={{ color: "#e05252", marginTop: "12px" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?{" "}
          <Link to="/signup">Create Account</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
