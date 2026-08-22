import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, LockKeyhole, PlaneTakeoff } from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/Shared';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', formData);
      const payload = response.data?.data || response.data;
      const authToken = payload.token || payload.accessToken || payload.authToken;
      const authUser = payload.user || payload.profile || {
        name: payload.name || formData.email.split('@')[0],
        email: formData.email,
      };

      if (!authToken) {
        throw new Error('Authentication token missing from server response.');
      }

      login({ token: authToken, user: authUser });
      navigate('/dashboard');
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          submissionError.message ||
          'Unable to log in. Please check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-hero card-surface">
        <div className="hero-topline">
          <PlaneTakeoff size={20} />
          <span>GlobeTrotter</span>
        </div>
        <h1>Plan the journey of a lifetime.</h1>
        <p>
          Build polished trip ideas, organize city stops, compare costs, and share your
          itinerary with friends in minutes.
        </p>
        <ul className="feature-list">
          <li>Smart trip planning</li>
          <li>City-by-city itineraries</li>
          <li>Budget transparency</li>
        </ul>
      </div>

      <div className="auth-panel card-surface">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue planning.</p>
        </div>

        <ErrorBanner message={error} />

        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </label>

          <label className="field-group">
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={16} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footnote">
          No account yet? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
