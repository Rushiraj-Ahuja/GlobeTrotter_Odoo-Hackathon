import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, MapPinned, PlusCircle } from 'lucide-react';
import apiClient from '../api';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
} from '../components/Shared';

const resolveData = (payload) => payload?.data || payload?.trips || payload || [];

const formatDate = (value) => {
  if (!value) return 'Flexible plan';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrips = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/trips');
        const nextTrips = resolveData(response.data);

        if (isMounted) {
          setTrips(Array.isArray(nextTrips) ? nextTrips : []);
          setError('');
        }
      } catch (submissionError) {
        if (isMounted) {
          setError(
            submissionError.response?.data?.message ||
              submissionError.response?.data?.error ||
              'Unable to load trips right now.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="My Trips"
        subtitle="Review and continue the adventures you are building."
        action={
          <Link to="/trips/create" className="primary-button">
            <PlusCircle size={16} />
            New trip
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <SectionCard title="Saved itineraries">
          {trips.length === 0 ? (
            <EmptyState
              title="No journeys saved yet"
              description="Create a trip to start mapping out cities, activities, and budgets."
              action={
                <Link to="/trips/create" className="secondary-button">
                  Plan a new trip
                </Link>
              }
            />
          ) : (
            <div className="trip-list">
              {trips.map((trip) => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className="trip-list-item card-surface">
                  <div
                    className="trip-list-image"
                    style={{
                      backgroundImage: trip.cover_photo_url
                        ? `url(${trip.cover_photo_url})`
                        : 'linear-gradient(135deg, #dbeafe, #e0f2fe)',
                    }}
                  />
                  <div className="trip-list-copy">
                    <div className="trip-list-meta">
                      <span className="chip">Trip</span>
                      {trip.share_token ? <span className="chip muted">Shared</span> : null}
                    </div>
                    <h3>{trip.name}</h3>
                    <p>{trip.description || 'Add a trip description to capture your travel vision.'}</p>
                    <div className="trip-info-row">
                      <span>
                        <CalendarRange size={14} />
                        {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                      </span>
                      <span>
                        <MapPinned size={14} />
                        {Array.isArray(trip.trip_stops) ? trip.trip_stops.length : 0} stops
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
