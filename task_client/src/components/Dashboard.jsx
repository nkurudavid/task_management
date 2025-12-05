import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const StatCard = ({ title, value, color }) => (
    <div className={`${color} rounded-lg p-6 shadow-lg`}>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      <p className="text-white text-4xl font-bold">{value}</p>
    </div>
  );

  if (!stats) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={stats.total_tasks} color="bg-sky-500" />
        <StatCard title="Pending" value={stats.pending_tasks} color="bg-orange-500" />
        <StatCard title="In Progress" value={stats.in_progress_tasks} color="bg-gray-700" />
        <StatCard title="Completed" value={stats.completed_tasks} color="bg-gray-900" />
        {stats.total_students !== null && user.role !== 'student' && (
          <StatCard title="Total Students" value={stats.total_students} color="bg-sky-600" />
        )}
      </div>
    </div>
  );
};

export default Dashboard;