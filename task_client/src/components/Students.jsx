import React, { useState, useEffect } from 'react';
import { Plus, UserCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    role: 'student'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        credentials: 'include'
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchStudents();
        setShowModal(false);
        setFormData({ email: '', username: '', password: '', full_name: '', role: 'student' });
      }
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          {user?.role === 'student' ? 'Colleagues' : 'Students'}
        </h2>
        {user?.role === 'lecturer' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add Student
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                <UserCircle size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{student.full_name || student.username}</h3>
                <p className="text-gray-400 text-sm">{student.email}</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">
              Joined: {new Date(student.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Student</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                Create Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;