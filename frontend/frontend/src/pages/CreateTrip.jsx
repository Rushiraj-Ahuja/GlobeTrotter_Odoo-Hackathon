import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import apiClient from '../api';
import { ErrorBanner, PageHeader } from '../components/Shared';

const emptyForm = {
  name: '',
  start_date: '',
  end_date: '',
  description: '',
  cover_photo_url: '',
};

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name || !formData.start_date || !formData.end_date) {
      setError('Trip name, start date, and end date are required.');
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after the start date.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/trips', formData);
      const payload = response.data?.data || response.data?.trip || response.data;
      const tripId = payload.id;

      if (!tripId) {
        throw new Error('Trip was created without an id returned by the server.');
      }

      navigate(`/trips/${tripId}`);
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          submissionError.message ||
          'Unable to create the trip. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Create Trip"
        subtitle="Set the trip identity, dates, and overview before adding stops and activities."
      />

      {error ? <ErrorBanner message={error} /> : null}

      <form className="card-surface form-card" onSubmit={handleSubmit}>
        <div className="field-grid">
          <label className="field-group">
            <span>Trip name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Epic Italy Escape"
            />
          </label>

          <label className="field-group">
            <span>Cover photo URL</span>
            <input
              type="url"
              name="cover_photo_url"
              value={formData.cover_photo_url}
              onChange={handleChange}
              placeholder="https://images.example.com/italy.jpg"
            />
          </label>

          <label className="field-group">
            <span>Start date</span>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </label>

          <label className="field-group">
            <span>End date</span>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </label>

          <label className="field-group full-width">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the mood, purpose, and highlights of this journey."
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            <PlusCircle size={16} />
            {loading ? 'Creating trip…' : 'Create trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
