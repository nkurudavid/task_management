import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'lecturer') {
      fetchStudents();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

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
      const url = editingTask ? `${API_URL}/tasks/${editingTask.id}` : `${API_URL}/tasks`;
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null
        })
      });
      
      if (response.ok) {
        fetchTasks();
        setShowModal(false);
        setEditingTask(null);
        setFormData({ title: '', description: '', assignee_id: '', due_date: '', status: 'pending' });
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`${API_URL}/tasks/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'in_progress': return 'bg-sky-500';
      case 'completed': return 'bg-gray-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Tasks</h2>
        {user?.role === 'lecturer' && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add Task
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{task.title}</h3>
                <p className="text-gray-400 mb-3">{task.description}</p>
                <div className="flex gap-3 items-center">
                  <span className={`${getStatusColor(task.status)} text-white px-3 py-1 rounded-full text-sm`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  {task.due_date && (
                    <span className="text-gray-400 text-sm">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {user?.role === 'lecturer' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-sky-400 hover:text-sky-300"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'Add Task'}
              </h3>
              <button onClick={() => {
                setShowModal(false);
                setEditingTask(null);
                setFormData({ title: '', description: '', assignee_id: '', due_date: '', status: 'pending' });
              }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Assign to Student</label>
                <select
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">None</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name || student.username}
                    </option>
                  ))}
                </select>
              </div>
              
              {editingTask && (
                <div>
                  <label className="block text-white mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-white mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;