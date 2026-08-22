import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner, LoadingState, PageHeader } from '../components/Shared';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    language: 'English',
    photo_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/profile');
        const payload = response.data?.data || response.data?.user || response.data || {};
        const nextProfile = {
          name: payload.name || user?.name || '',
          email: payload.email || user?.email || '',
          language: payload.language || 'English',
          photo_url: payload.photo_url || '',
        };

        if (isMounted) {
          setFormData(nextProfile);
          setError('');
        }
      } catch (submissionError) {
        if (isMounted) {
          setError(
            submissionError.response?.data?.message ||
              submissionError.response?.data?.error ||
              'Unable to load your profile information.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');

    setSubmitting(true);

    try {
      const response = await apiClient.put('/profile', formData);
      const payload = response.data?.data || response.data?.user || response.data || formData;
      updateUser(payload);
      setSuccess('Profile updated successfully.');
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to update your profile.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Profile"
        subtitle="Keep your travel details polished and ready for every itinerary."
      />

      {error ? <ErrorBanner message={error} /> : null}
      {success ? <div className="success-banner">{success}</div> : null}

      <form className="card-surface form-card" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field-group">
            <span>Name</span>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>

          <label className="field-group">
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>

          <label className="field-group">
            <span>Language</span>
            <input type="text" name="language" value={formData.language} onChange={handleChange} />
          </label>

          <label className="field-group">
            <span>Photo URL</span>
            <input type="url" name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="https://..." />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={submitting}>
            <Save size={16} />
            {submitting ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
