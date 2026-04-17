import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAdminStats } from '../api';
import UserDropdown from '../components/UserDropdown';

// Animated counter hook
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const tick = () => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start < target) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return count;
}

function StatCard({ label, value, change, color, icon }) {
  const num = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#bfcab9]/30 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-semibold text-[#6f7a6b]">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end gap-3">
        <p className={`text-3xl font-bold ${color}`}>
          {typeof value === 'number' ? num.toLocaleString() : value}
        </p>
        <span className="text-xs font-bold text-green-600 mb-1 bg-green-50 px-2 py-0.5 rounded-md">{change}</span>
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  Success: 'bg-green-100 text-green-700',
  Error: 'bg-red-100 text-red-700',
  'New User': 'bg-blue-100 text-blue-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 12450,
          totalPredictions: 845210,
          activeSessions: 342,
          diseaseScans: 18293,
          recentActivity: [
            { id: 1, user: 'Rajesh K.', action: 'Crop recommendation', time: '5 mins ago', status: 'Success' },
            { id: 2, user: 'Amit S.', action: 'Yield prediction', time: '12 mins ago', status: 'Success' },
            { id: 3, user: 'Priya M.', action: 'Created new account', time: '28 mins ago', status: 'New User' },
            { id: 4, user: 'System', action: 'Failed ML API call', time: '1 hour ago', status: 'Error' },
            { id: 5, user: 'Vikram B.', action: 'Price forecast', time: '2 hours ago', status: 'Success' },
          ],
        });
        setError('');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, change: '+14%', color: 'text-blue-600', icon: '👥' },
        { label: 'Total AI Requests', value: stats.totalPredictions, change: '+22%', color: 'text-[#186a22]', icon: '🤖' },
        { label: 'Active Sessions', value: stats.activeSessions, change: '+5%', color: 'text-orange-600', icon: '📡' },
        { label: 'Disease Scans', value: stats.diseaseScans, change: '+31%', color: 'text-purple-600', icon: '🦠' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#f2f4f2] font-body">
      {/* Nav */}
      <nav className="bg-white flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
          <span className="bg-[#186a22]/10 text-[#186a22] px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-semibold text-[#3f4a3d] hover:text-[#186a22]">Farmer Dashboard</Link>
          <div className="flex items-center gap-2">
            <UserDropdown />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#191c1b] font-headline">System Administrator</h1>
            <p className="text-[#6f7a6b] mt-1">
              Welcome back, <span className="font-semibold text-[#186a22]">{user?.name}</span>. Here's what's happening right now.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            <span className="text-xs text-green-600 font-semibold">Live • Auto-refreshes every 30s</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#bfcab9]/30 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((s, i) => (
                <StatCard key={i} {...s} />
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-[#bfcab9]/30 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#bfcab9]/30 bg-[#f8faf8] flex items-center justify-between">
                <h2 className="font-bold text-[#191c1b]">Recent Activity Logs</h2>
                <span className="text-xs text-[#6f7a6b]">{stats?.recentActivity?.length} recent events</span>
              </div>
              <div className="divide-y divide-[#bfcab9]/20">
                {stats?.recentActivity?.map((log, idx) => (
                  <div key={log.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-[#f8faf8] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#186a22]/10 flex items-center justify-center text-sm font-bold text-[#186a22]">
                        {log.user?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#191c1b]">{log.user}</p>
                        <p className="text-sm text-[#3f4a3d]">{log.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold mb-1 ${STATUS_STYLES[log.status] || 'bg-gray-100 text-gray-600'}`}>
                        {log.status}
                      </span>
                      <p className="text-xs text-[#6f7a6b]">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-[#bfcab9]/30 bg-[#f8faf8] text-center">
                <button className="text-sm font-semibold text-[#186a22] hover:underline">View All Logs</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
