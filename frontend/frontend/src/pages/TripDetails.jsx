import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarRange, Copy, MapPinned, Share2, Trash2, Wallet } from 'lucide-react';
import apiClient from '../api';
import { EmptyState, ErrorBanner, LoadingState, PageHeader } from '../components/Shared';

const resolveTrip = (payload) => payload?.data || payload?.trip || payload || {};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

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

export default function TripDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrip = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/trips/${id}`);

        if (isMounted) {
          setTrip(resolveTrip(response.data));
          setError('');
        }
      } catch (submissionError) {
        if (isMounted) {
          setError(
            submissionError.response?.data?.message ||
              submissionError.response?.data?.error ||
              'Unable to load this trip.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadTrip();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const tripStops = useMemo(() => {
    if (!trip) return [];
    return Array.isArray(trip.trip_stops) ? trip.trip_stops : Array.isArray(trip.stops) ? trip.stops : [];
  }, [trip]);

  const totalBudget = useMemo(
    () =>
      tripStops.reduce((sum, stop) => {
        const stopActivities = Array.isArray(stop.stop_activities)
          ? stop.stop_activities
          : Array.isArray(stop.activities)
            ? stop.activities
            : [];

        const activitySpend = stopActivities.reduce((activityTotal, activityRecord) => {
          const activity = activityRecord.activity || activityRecord;
          return activityTotal + Number(activityRecord.custom_cost || activity.cost || 0);
        }, 0);

        return sum + Number(stop.transport_cost || 0) + Number(stop.stay_cost || 0) + Number(stop.meals_cost || 0) + activitySpend;
      }, 0),
    [tripStops],
  );

  const shareUrl = trip?.share_token ? `${window.location.origin}/public/trips/${trip.share_token}` : '';

  const handleShare = async () => {
    if (!shareUrl) return;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }

    window.alert('Trip link copied to clipboard.');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/trips/${id}`);
      navigate('/my-trips');
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to delete this trip.',
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={trip?.name || 'Trip details'}
        subtitle={trip?.description || 'Review your trip structure and planning details.'}
        action={
          <div className="inline-actions">
            <button type="button" className="secondary-button" onClick={() => navigate(`/trips/${id}/itinerary`)}>
              Itinerary
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate(`/trips/${id}/budget`)}>
              Budget
            </button>
          </div>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {!trip ? null : (
        <>
          <div className="card-surface trip-showcase">
            <div
              className="trip-hero large"
              style={{
                backgroundImage: trip.cover_photo_url
                  ? `linear-gradient(rgba(15,23,42,0.12), rgba(15,23,42,0.26)), url(${trip.cover_photo_url})`
                  : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              }}
            />

            <div className="trip-showcase-body">
              <div className="trip-meta-row">
                <span>
                  <CalendarRange size={14} />
                  {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
                </span>
                <span>
                  <Wallet size={14} />
                  {formatCurrency(totalBudget)}
                </span>
              </div>

              <div className="trip-actions-row">
                <button type="button" className="primary-button" onClick={handleShare}>
                  <Share2 size={16} />
                  Share trip
                </button>
                <button type="button" className="secondary-button danger-button" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Delete trip
                </button>
              </div>
            </div>
          </div>

          <div className="details-grid">
            <div className="card-surface detail-panel">
              <h3>Trip overview</h3>
              <div className="mini-list">
                <div>
                  <span>Start date</span>
                  <strong>{formatDate(trip.start_date)}</strong>
                </div>
                <div>
                  <span>End date</span>
                  <strong>{formatDate(trip.end_date)}</strong>
                </div>
                <div>
                  <span>Stops</span>
                  <strong>{tripStops.length}</strong>
                </div>
                <div>
                  <span>Share link</span>
                  <strong>{trip.share_token ? 'Active' : 'Not shared'}</strong>
                </div>
              </div>
            </div>

            <div className="card-surface detail-panel">
              <h3>Quick actions</h3>
              <div className="button-stack vertical">
                <Link to={`/trips/${id}/itinerary`} className="secondary-button full-width">
                  Build itinerary
                </Link>
                <Link to={`/trips/${id}/budget`} className="secondary-button full-width">
                  View budget
                </Link>
                {shareUrl ? (
                  <button type="button" className="secondary-button full-width" onClick={handleShare}>
                    <Copy size={16} />
                    Copy public link
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card-surface detail-panel full-width-panel">
            <h3>Stops</h3>
            {tripStops.length === 0 ? (
              <EmptyState
                title="No stops scheduled"
                description="Add a city and start preparing a more detailed route."
                action={
                  <Link to={`/trips/${id}/itinerary`} className="secondary-button">
                    Add your first stop
                  </Link>
                }
              />
            ) : (
              <div className="stop-list">
                {tripStops.map((stop) => {
                  const stopActivities = Array.isArray(stop.stop_activities)
                    ? stop.stop_activities
                    : Array.isArray(stop.activities)
                      ? stop.activities
                      : [];

                  return (
                    <div key={stop.id} className="stop-item">
                      <div className="stop-item-header">
                        <div>
                          <div className="eyebrow-row">
                            <MapPinned size={14} />
                            <span>{stop.city?.name || 'Destination'}</span>
                          </div>
                          <h3>{stop.city?.name || 'Destination'}</h3>
                        </div>
                      </div>

                      <div className="trip-info-row compact">
                        <span>
                          <CalendarRange size={14} />
                          {formatDate(stop.start_date)} → {formatDate(stop.end_date)}
                        </span>
                        <span>{formatCurrency(Number(stop.transport_cost || 0) + Number(stop.stay_cost || 0) + Number(stop.meals_cost || 0))}</span>
                      </div>

                      {stopActivities.length === 0 ? (
                        <p className="empty-inline">No activities on this stop yet.</p>
                      ) : (
                        <ul className="activity-list">
                          {stopActivities.map((activityRecord) => {
                            const activity = activityRecord.activity || activityRecord;
                            return (
                              <li key={activityRecord.id || activity.id}>
                                <div>
                                  <strong>{activity.name}</strong>
                                  <span>{activity.activity_type || 'Activity'}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
