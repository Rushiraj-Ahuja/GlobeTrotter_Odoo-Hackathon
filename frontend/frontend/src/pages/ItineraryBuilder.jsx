/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarRange, MapPinned, PlusCircle, Trash2 } from 'lucide-react';
import apiClient from '../api';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
} from '../components/Shared';

const resolveTrip = (payload) => payload?.data || payload?.trip || payload || {};
const resolveCollection = (payload) => (Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []);

export default function ItineraryBuilderPage() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stopForm, setStopForm] = useState({
    city_id: '',
    start_date: '',
    end_date: '',
    transport_cost: '',
    stay_cost: '',
    meals_cost: '',
  });
  const [activitySelection, setActivitySelection] = useState({});

  const refreshTripDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [tripResponse, citiesResponse, activitiesResponse] = await Promise.all([
        apiClient.get(`/trips/${tripId}`),
        apiClient.get('/cities'),
        apiClient.get('/activities'),
      ]);

      const nextTrip = resolveTrip(tripResponse.data);
      setTrip(nextTrip);
      setCities(resolveCollection(citiesResponse.data));
      setActivities(resolveCollection(activitiesResponse.data));
      setError('');
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to load itinerary builder. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void refreshTripDetails();
  }, [refreshTripDetails]);

  const tripStops = useMemo(() => {
    if (!trip) return [];
    return Array.isArray(trip.trip_stops) ? trip.trip_stops : Array.isArray(trip.stops) ? trip.stops : [];
  }, [trip]);

  const cityLookup = useMemo(
    () =>
      cities.reduce((lookup, city) => {
        lookup[city.id] = city;
        return lookup;
      }, {}),
    [cities],
  );

  const selectedCityActivities = useMemo(() => {
    if (!stopForm.city_id) return [];
    return activities.filter((activity) => Number(activity.city_id) === Number(stopForm.city_id));
  }, [activities, stopForm.city_id]);

  const handleStopChange = (event) => {
    const { name, value } = event.target;
    setStopForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddStop = async (event) => {
    event.preventDefault();

    if (!stopForm.city_id || !stopForm.start_date || !stopForm.end_date) {
      setError('Please select a city and provide both dates for the stop.');
      return;
    }

    try {
      const payload = {
        trip_id: Number(tripId),
        city_id: Number(stopForm.city_id),
        start_date: stopForm.start_date,
        end_date: stopForm.end_date,
        stop_order: tripStops.length + 1,
        transport_cost: Number(stopForm.transport_cost || 0),
        stay_cost: Number(stopForm.stay_cost || 0),
        meals_cost: Number(stopForm.meals_cost || 0),
      };

      await apiClient.post(`/trips/${tripId}/stops`, payload);
      setStopForm({
        city_id: '',
        start_date: '',
        end_date: '',
        transport_cost: '',
        stay_cost: '',
        meals_cost: '',
      });
      await refreshTripDetails();
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to add stop. Please verify the travel details and try again.',
      );
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Remove this stop and its activities?')) {
      return;
    }

    try {
      await apiClient.delete(`/stops/${stopId}`);
      await refreshTripDetails();
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to remove this stop.',
      );
    }
  };

  const handleAddActivity = async (stopId) => {
    const selectedActivityId = activitySelection[stopId];

    if (!selectedActivityId) {
      setError('Select an activity before adding it to the stop.');
      return;
    }

    try {
      await apiClient.post(`/stops/${stopId}/activities`, {
        activity_id: Number(selectedActivityId),
        activity_date: trip?.start_date || new Date().toISOString().slice(0, 10),
        activity_time: '09:00',
        custom_cost: 0,
      });
      setActivitySelection((current) => ({ ...current, [stopId]: '' }));
      await refreshTripDetails();
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to add activity to the selected stop.',
      );
    }
  };

  const handleRemoveActivity = async (activityRecordId) => {
    try {
      await apiClient.delete(`/activities/${activityRecordId}`);
      await refreshTripDetails();
    } catch (submissionError) {
      setError(
        submissionError.response?.data?.message ||
          submissionError.response?.data?.error ||
          'Unable to remove the activity.',
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Itinerary Builder"
        subtitle={trip ? `Customize stops and activities for ${trip.name}.` : 'Build your travel day by day.'}
        action={
          <button type="button" className="secondary-button" onClick={() => navigate(`/trips/${tripId}`)}>
            Back to trip
          </button>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <SectionCard title="Add city stop">
        <form className="form-card compact-form" onSubmit={handleAddStop}>
          <div className="field-grid">
            <label className="field-group">
              <span>City</span>
              <select name="city_id" value={stopForm.city_id} onChange={handleStopChange}>
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} · {city.country}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Start date</span>
              <input type="date" name="start_date" value={stopForm.start_date} onChange={handleStopChange} />
            </label>

            <label className="field-group">
              <span>End date</span>
              <input type="date" name="end_date" value={stopForm.end_date} onChange={handleStopChange} />
            </label>

            <label className="field-group">
              <span>Transport cost</span>
              <input type="number" name="transport_cost" value={stopForm.transport_cost} onChange={handleStopChange} placeholder="0" min="0" />
            </label>

            <label className="field-group">
              <span>Stay cost</span>
              <input type="number" name="stay_cost" value={stopForm.stay_cost} onChange={handleStopChange} placeholder="0" min="0" />
            </label>

            <label className="field-group">
              <span>Meals cost</span>
              <input type="number" name="meals_cost" value={stopForm.meals_cost} onChange={handleStopChange} placeholder="0" min="0" />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              <PlusCircle size={16} />
              Add stop
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Trip stops">
        {tripStops.length === 0 ? (
          <EmptyState
            title="No stops yet"
            description="Add your first city stop to start building the itinerary."
          />
        ) : (
          <div className="stop-list">
            {tripStops.map((stop) => {
              const city = cityLookup[stop.city_id] || stop.city || {};
              const stopActivities = Array.isArray(stop.stop_activities)
                ? stop.stop_activities
                : Array.isArray(stop.activities)
                  ? stop.activities
                  : [];

              return (
                <div key={stop.id} className="stop-item card-surface">
                  <div className="stop-item-header">
                    <div>
                      <div className="eyebrow-row">
                        <MapPinned size={14} />
                        <span>{city.name || 'City'} · {city.country || 'Destination'}</span>
                      </div>
                      <h3>
                        {city.name || 'City'}
                      </h3>
                    </div>
                    <button type="button" className="icon-button danger" onClick={() => handleDeleteStop(stop.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="trip-info-row compact">
                    <span>
                      <CalendarRange size={14} />
                      {stop.start_date || trip.start_date} → {stop.end_date || trip.end_date}
                    </span>
                    <span>${Number(stop.transport_cost || 0) + Number(stop.stay_cost || 0) + Number(stop.meals_cost || 0)}</span>
                  </div>

                  <div className="activity-manager">
                    <select
                      value={activitySelection[stop.id] || ''}
                      onChange={(event) =>
                        setActivitySelection((current) => ({
                          ...current,
                          [stop.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select activity</option>
                      {selectedCityActivities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="secondary-button" onClick={() => handleAddActivity(stop.id)}>
                      Add activity
                    </button>
                  </div>

                  {stopActivities.length === 0 ? (
                    <p className="empty-inline">No activities added for this stop yet.</p>
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
                            <button type="button" className="ghost-link" onClick={() => handleRemoveActivity(activityRecord.id)}>
                              Remove
                            </button>
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
      </SectionCard>
    </div>
  );
}
