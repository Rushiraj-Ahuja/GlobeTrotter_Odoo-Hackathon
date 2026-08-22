import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import apiClient from '../api';
import { ErrorBanner, LoadingState, PageHeader, SectionCard } from '../components/Shared';

const resolveTrip = (payload) => payload?.data || payload?.trip || payload || {};
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

export default function BudgetPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTrip = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/trips/${tripId}`);

        if (isMounted) {
          setTrip(resolveTrip(response.data));
          setError('');
        }
      } catch (submissionError) {
        if (isMounted) {
          setError(
            submissionError.response?.data?.message ||
              submissionError.response?.data?.error ||
              'Unable to load the travel budget right now.',
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const budgetBreakdown = useMemo(() => {
    if (!trip) return { transport: 0, stay: 0, meals: 0, activities: 0, total: 0 };

    const tripStops = Array.isArray(trip.trip_stops) ? trip.trip_stops : Array.isArray(trip.stops) ? trip.stops : [];

    const summary = tripStops.reduce(
      (totals, stop) => {
        const stopActivities = Array.isArray(stop.stop_activities)
          ? stop.stop_activities
          : Array.isArray(stop.activities)
            ? stop.activities
            : [];

        const activityCost = stopActivities.reduce((sum, record) => {
          const source = record.activity || record;
          return sum + Number(record.custom_cost || source.cost || 0);
        }, 0);

        totals.transport += Number(stop.transport_cost || 0);
        totals.stay += Number(stop.stay_cost || 0);
        totals.meals += Number(stop.meals_cost || 0);
        totals.activities += activityCost;
        return totals;
      },
      { transport: 0, stay: 0, meals: 0, activities: 0 },
    );

    summary.total = summary.transport + summary.stay + summary.meals + summary.activities;
    return summary;
  }, [trip]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Budget Breakdown"
        subtitle={trip ? `Expense overview for ${trip.name}.` : 'Track your spending.'}
      />

      {error ? <ErrorBanner message={error} /> : null}

      {!trip ? null : (
        <>
          <div className="stats-grid single-row">
            <div className="stat-card budget-stat">
              <div className="stat-icon blue">
                <Wallet size={18} />
              </div>
              <div>
                <span>Total planned</span>
                <strong>{formatCurrency(budgetBreakdown.total)}</strong>
              </div>
            </div>
          </div>

          <SectionCard title="Expense summary">
            <div className="budget-list">
              <div className="budget-row">
                <span>Transport</span>
                <strong>{formatCurrency(budgetBreakdown.transport)}</strong>
              </div>
              <div className="budget-row">
                <span>Stay</span>
                <strong>{formatCurrency(budgetBreakdown.stay)}</strong>
              </div>
              <div className="budget-row">
                <span>Meals</span>
                <strong>{formatCurrency(budgetBreakdown.meals)}</strong>
              </div>
              <div className="budget-row">
                <span>Activities</span>
                <strong>{formatCurrency(budgetBreakdown.activities)}</strong>
              </div>
              <div className="budget-row total">
                <span>Total</span>
                <strong>{formatCurrency(budgetBreakdown.total)}</strong>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
