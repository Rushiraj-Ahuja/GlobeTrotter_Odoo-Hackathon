import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarRange, MapPinned } from 'lucide-react';
import apiClient from '../api';
import { ErrorBanner, LoadingState, PageHeader } from '../components/Shared';

const resolveTrip = (payload) => payload?.data || payload?.trip || payload || {};
const formatDate = (value) => {
  if (!value) return 'Flexible dates';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default function PublicTripPage() {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPublicTrip = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/public/trips/${token}`);
        const nextTrip = resolveTrip(response.data);

        if (isMounted) {
          setTrip(nextTrip);
          setError('');
        }
      } catch (submissionError) {
        if (isMounted) {
          setError(
            submissionError.response?.data?.message ||
              submissionError.response?.data?.error ||
              'This itinerary could not be loaded.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      void loadPublicTrip();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  const tripStops = useMemo(() => {
    if (!trip) return [];
    return Array.isArray(trip.trip_stops) ? trip.trip_stops : Array.isArray(trip.stops) ? trip.stops : [];
  }, [trip]);

  if (loading) {
    return <LoadingState message="Loading shared itinerary…" />;
  }

  if (error) {
    return (
      <div className="page-stack">
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div className="page-stack public-page">
      <PageHeader
        title={trip?.name || 'Shared itinerary'}
        subtitle={trip?.description || 'View the trip itinerary.'}
      />

      <div className="card-surface trip-showcase">
        <div
          className="trip-hero large"
          style={{
            backgroundImage: trip?.cover_photo_url
              ? `linear-gradient(rgba(15,23,42,0.12), rgba(15,23,42,0.26)), url(${trip.cover_photo_url})`
              : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          }}
        />

        <div className="trip-showcase-body">
          <div className="trip-meta-row">
            <span>
              <CalendarRange size={14} />
              {formatDate(trip?.start_date)} → {formatDate(trip?.end_date)}
            </span>
          </div>
        </div>
      </div>

      <div className="public-itinerary">
        {tripStops.length === 0 ? (
          <div className="card-surface empty-box">
            <p>No stops have been added to this public itinerary yet.</p>
          </div>
        ) : (
          tripStops.map((stop) => (
            <div key={stop.id} className="stop-item card-surface">
              <div className="stop-item-header">
                <div>
                  <div className="eyebrow-row">
                    <MapPinned size={14} />
                    <span>{stop.city?.name || 'City'} · {stop.city?.country || 'Destination'}</span>
                  </div>
                  <h3>{stop.city?.name || 'Destination'}</h3>
                </div>
              </div>

              <div className="trip-info-row compact">
                <span>{formatDate(stop.start_date)} → {formatDate(stop.end_date)}</span>
              </div>

              {Array.isArray(stop.stop_activities) && stop.stop_activities.length > 0 ? (
                <ul className="activity-list">
                  {stop.stop_activities.map((activityRecord) => (
                    <li key={activityRecord.id}>
                      <div>
                        <strong>{activityRecord.activity?.name || activityRecord.name}</strong>
                        <span>{activityRecord.activity?.activity_type || 'Plan'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-inline">No activities on this stop yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
