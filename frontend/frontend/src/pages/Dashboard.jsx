import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarRange,
  Compass,
  MapPinned,
  PlusCircle,
  Route,
  Wallet,
} from 'lucide-react';
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
  if (!value) return 'Flexible dates';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed);
};

export default function DashboardPage() {
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
              'Unable to load trips. Please try again.',
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

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const upcomingTrips = trips.filter((trip) => {
      if (!trip.start_date) return false;
      return new Date(trip.start_date) >= new Date();
    }).length;
    const cityCount = trips.reduce((count, trip) => {
      const stops = Array.isArray(trip.trip_stops)
        ? trip.trip_stops
        : Array.isArray(trip.stops)
          ? trip.stops
          : [];
      return count + stops.length;
    }, 0);

    return {
      totalTrips,
      upcomingTrips,
      cityCount,
    };
  }, [trips]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your trip plans, upcoming destinations, and travel momentum."
        action={
          <Link to="/trips/create" className="primary-button">
            <PlusCircle size={16} />
            Create trip
          </Link>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Route size={18} />
              </div>
              <div>
                <span>Total trips</span>
                <strong>{stats.totalTrips}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon teal">
                <CalendarRange size={18} />
              </div>
              <div>
                <span>Upcoming</span>
                <strong>{stats.upcomingTrips}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon gold">
                <MapPinned size={18} />
              </div>
              <div>
                <span>City stops</span>
                <strong>{stats.cityCount}</strong>
              </div>
            </div>
          </div>

          <div className="action-grid">
            <Link to="/my-trips" className="quick-card card-surface">
              <Compass size={20} />
              <div>
                <strong>My trips</strong>
                <span>Open all saved routes</span>
              </div>
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/trips/create" className="quick-card card-surface">
              <PlusCircle size={20} />
              <div>
                <strong>New trip</strong>
                <span>Plan a fresh itinerary</span>
              </div>
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/profile" className="quick-card card-surface">
              <Wallet size={20} />
              <div>
                <strong>Profile</strong>
                <span>Update traveler details</span>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <SectionCard title="Recent trips">
            {trips.length === 0 ? (
              <EmptyState
                title="No trips yet"
                description="Start by creating a new itinerary to begin your travel story."
                action={
                  <Link to="/trips/create" className="secondary-button">
                    Create your first trip
                  </Link>
                }
              />
            ) : (
              <div className="trip-grid">
                {trips.slice(0, 4).map((trip) => (
                  <Link key={trip.id} to={`/trips/${trip.id}`} className="trip-card card-surface">
                    <div
                      className="trip-hero"
                      style={{
                        backgroundImage: trip.cover_photo_url
                          ? `linear-gradient(rgba(15,23,42,0.08), rgba(15,23,42,0.42)), url(${trip.cover_photo_url})`
                          : 'linear-gradient(135deg, #dbeafe, #f3f4f6)',
                      }}
                    >
                      <span>{trip.name}</span>
                    </div>
                    <div className="trip-body">
                      <p>{trip.description || 'No description yet.'}</p>
                      <div className="trip-meta-row">
                        <span>{formatDate(trip.start_date)}</span>
                        <span>→</span>
                        <span>{formatDate(trip.end_date)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
