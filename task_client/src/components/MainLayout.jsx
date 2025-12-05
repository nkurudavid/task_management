import React, { useState } from 'react';
import { Users, ClipboardList, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Tasks from './Tasks';
import Students from './Students';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full ${
        currentPage === page
          ? 'bg-orange-500 text-white'
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">TaskMgmt</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{user?.role}</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <MenuItem icon={LayoutDashboard} label="Dashboard" page="dashboard" />
          <MenuItem icon={UserCircle} label="Profile" page="profile" />
          <MenuItem icon={ClipboardList} label="Tasks" page="tasks" />
          <MenuItem icon={Users} label={user?.role === 'student' ? 'Colleagues' : 'Students'} page="students" />
        </nav>
        
        <div className="mt-auto pt-8">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'profile' && <Profile />}
          {currentPage === 'tasks' && <Tasks />}
          {currentPage === 'students' && <Students />}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;