import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Mail, LockKeyhole, UserRound, PlaneTakeoff } from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/Shared';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please complete all fields to create an account.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/signup', formData);
      const payload = response.data?.data || response.data;
      const authToken = payload.token || payload.accessToken || payload.authToken;
      const authUser = payload.user || payload.profile || {
        name: formData.name,
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
          'Unable to create an account right now.',
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
        <h1>Start your next adventure with confidence.</h1>
        <p>
          Create a profile, structure your route, and turn ideas into a beautifully organized
          trip.
        </p>
        <ul className="feature-list">
          <li>Track destinations</li>
          <li>Save shared plans</li>
          <li>Manage budgets</li>
        </ul>
      </div>

      <div className="auth-panel card-surface">
        <div className="auth-header">
          <h2>Create account</h2>
          <p>Start planning smarter today.</p>
        </div>

        <ErrorBanner message={error} />

        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Full name</span>
            <div className="input-wrap">
              <UserRound size={16} />
              <input
                type="text"
                name="name"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </label>

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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
            <Check size={16} />
          </button>
        </form>

        <div className="auth-footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
