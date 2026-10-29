import type { AnalyticsData, Profile } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface AdminAnalyticsProps {
  analyticsData: AnalyticsData | null;
  loadingAnalytics: boolean;
  fetchAnalyticsData: () => void;
  adminPlayers: Profile[];
}

const TIER_COLORS: Record<string, string> = {
  free: '#71717A',
  bronze: '#CD7F32',
  gold: '#FFB020',
};

const CHART_TOOLTIP_STYLE = { background: '#18181B', border: '1px solid #27272A', borderRadius: '8px', color: '#F4F4F5' };

function AdminAnalytics({ analyticsData, loadingAnalytics, fetchAnalyticsData, adminPlayers }: AdminAnalyticsProps) {
  const tierCounts = adminPlayers.reduce((acc, p) => {
    acc[p.membership_tier] = (acc[p.membership_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tierData = (['free', 'bronze', 'gold'] as const)
    .map((tier) => ({ name: tier, value: tierCounts[tier] || 0 }))
    .filter((d) => d.value > 0);

  const revenueData = analyticsData ? [
    { name: 'Deposits', amount: analyticsData.totalDeposits, kind: 'in' },
    { name: 'Membership', amount: analyticsData.totalMembershipRevenue, kind: 'in' },
    { name: 'Mission Rewards', amount: analyticsData.totalMissionRewardsPaid, kind: 'out' },
    { name: 'Payouts', amount: analyticsData.totalPayouts, kind: 'out' },
  ] : [];

  const netRevenue = analyticsData
    ? analyticsData.totalDeposits + analyticsData.totalMembershipRevenue - analyticsData.totalPayouts
    : 0;

  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>Analytics</h3>
        <button onClick={fetchAnalyticsData} disabled={loadingAnalytics} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          {loadingAnalytics ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {!analyticsData ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
      ) : (
        <>
          <div className="stat-tiles-bar">
            <div className="stat-tile">
              <div className="stat-tile-val" style={{ color: 'var(--success)' }}>Rs. {analyticsData.totalDeposits.toFixed(0)}</div>
              <div className="stat-tile-lbl">Total Deposits</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val" style={{ color: 'var(--success)' }}>Rs. {analyticsData.totalMembershipRevenue.toFixed(0)}</div>
              <div className="stat-tile-lbl">Membership Revenue</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val" style={{ color: 'var(--danger)' }}>Rs. {analyticsData.totalMissionRewardsPaid.toFixed(0)}</div>
              <div className="stat-tile-lbl">Mission Rewards Paid</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val" style={{ color: 'var(--danger)' }}>Rs. {analyticsData.totalPayouts.toFixed(0)}</div>
              <div className="stat-tile-lbl">Payouts Processed</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val" style={{ color: netRevenue >= 0 ? 'var(--success)' : 'var(--danger)' }}>Rs. {netRevenue.toFixed(0)}</div>
              <div className="stat-tile-lbl">Net Revenue</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.75rem' }}>Revenue Breakdown</h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} />
                  <YAxis stroke="#A1A1AA" fontSize={12} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: any) => `Rs. ${Number(value).toFixed(0)}`} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {revenueData.map((entry) => (
                      <Cell key={entry.name} fill={entry.kind === 'in' ? '#C6FF00' : '#FF4D4D'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.75rem' }}>Membership Tier Distribution</h4>
              {tierData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No players yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => `${entry.name} (${entry.value})`}>
                      {tierData.map((entry) => (
                        <Cell key={entry.name} fill={TIER_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '0.75rem' }}>Mission Earnings Breakdown</h4>
            {analyticsData.missionBreakdown.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No approved mission payouts yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, analyticsData.missionBreakdown.length * 40)}>
                <BarChart data={analyticsData.missionBreakdown} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis type="number" stroke="#A1A1AA" fontSize={12} />
                  <YAxis type="category" dataKey="title" stroke="#A1A1AA" fontSize={12} width={160} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: any) => `Rs. ${Number(value).toFixed(0)}`} />
                  <Bar dataKey="total" fill="#C6FF00" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAnalytics;
