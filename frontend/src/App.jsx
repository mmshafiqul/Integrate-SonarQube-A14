import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Graph from './Graph.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUserTasks = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks/user/${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/users`, userForm);
      setUserForm({ name: '', email: '' });
      setShowUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      alert('Please select a user first before creating a task');
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        ...taskForm,
        userId: selectedUser.id
      });
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        status: 'pending'
      });
      setShowTaskForm(false);
      if (selectedUser) {
        fetchUserTasks(selectedUser.id);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/tasks/${editingTask.id}`, {
        ...taskForm,
        userId: selectedUser.id
      });
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        status: 'pending'
      });
      setEditingTask(null);
      setShowTaskForm(false);
      if (selectedUser) {
        fetchUserTasks(selectedUser.id);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response?.status === 403) {
        alert('You can only edit your own tasks');
      } else {
        alert('Error updating task: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        params: { userId: selectedUser.id }
      });
      if (selectedUser) {
        fetchUserTasks(selectedUser.id);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.response?.status === 403) {
        alert('You can only delete your own tasks');
      } else {
        alert('Error deleting task: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    fetchUserTasks(user.id);
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
      status: task.status
    });
    setShowTaskForm(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 animate-gradient">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2 animate-pulse">
            Daily Task Manager
          </h1>
          <p className="text-gray-700 font-medium">Organize your day with style and ease</p>
        </div>
        
        {/* Task Statistics Graph */}
        <div className="mb-8">
          <Graph tasks={tasks} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-105 border border-purple-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-purple-800 flex items-center">
                  <span className="mr-2">👥</span> Users
                </h2>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center">
                    <span className="mr-1">+</span> Add User
                  </span>
                </button>
              </div>
              
              {selectedUser && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-300 transform transition-all duration-300 animate-fade-in">
                  <p className="font-medium text-purple-900">✅ Selected: {selectedUser.name}</p>
                  <p className="text-sm text-purple-700">{selectedUser.email}</p>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      fetchTasks();
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
                  >
                    Show all tasks
                  </button>
                </div>
              )}
              
              <div className="space-y-3">
                {users.map((user, index) => (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`p-4 border rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-102 hover:shadow-md ${
                      selectedUser?.id === user.id 
                        ? 'border-purple-400 bg-gradient-to-r from-purple-100 to-pink-100 shadow-md' 
                        : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                    } animate-slide-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:scale-105 border border-indigo-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
                  <span className="mr-2">📋</span>
                  Tasks {selectedUser && <span className="text-purple-600 ml-2">for {selectedUser.name}</span>}
                </h2>
                <button
                  onClick={() => {
                    if (!selectedUser) {
                      alert('Please select a user first before creating a task');
                      return;
                    }
                    setEditingTask(null);
                    setTaskForm({
                      title: '',
                      description: '',
                      priority: 'medium',
                      due_date: '',
                      status: 'pending'
                    });
                    setShowTaskForm(true);
                  }}
                  className={`px-4 py-2 rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                    selectedUser 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!selectedUser}
                >
                  <span className="flex items-center">
                    <span className="mr-1">+</span> Add Task
                  </span>
                </button>
              </div>
              
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="border border-indigo-200 rounded-lg p-5 bg-gradient-to-br from-white to-indigo-50 transform transition-all duration-300 hover:shadow-lg hover:scale-102 hover:border-purple-300 hover:from-purple-50 hover:to-indigo-100 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
                          <span className="ml-2 text-2xl">
                            {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '💧'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 mt-2 mb-3">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transform transition-all duration-200 hover:scale-105 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transform transition-all duration-200 hover:scale-105 ${getStatusColor(task.status)}`}>
                            {task.status === 'completed' ? '✅' : task.status === 'in-progress' ? '🔄' : '⏳'} {task.status}
                          </span>
                          {task.due_date && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 transform transition-all duration-200 hover:scale-105 border border-purple-200">
                              📅 Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span className="mr-1">👤</span>
                          By: <span className="font-medium text-purple-600 ml-1">{task.user_name}</span> 
                          {selectedUser && task.user_id === selectedUser.id && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Yours</span>
                          )}
                          ({task.user_email})
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {selectedUser && task.user_id === selectedUser.id ? (
                          <>
                            <button
                              onClick={() => startEditTask(task)}
                              className="text-indigo-600 hover:text-indigo-800 transform transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-indigo-50"
                              title="Edit task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700 transform transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-red-50"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              disabled
                              className="text-gray-400 transform transition-all duration-200 p-2 rounded-lg cursor-not-allowed"
                              title="You can only edit your own tasks"
                            >
                              ✏️
                            </button>
                            <button
                              disabled
                              className="text-gray-400 transform transition-all duration-200 p-2 rounded-lg cursor-not-allowed"
                              title="You can only delete your own tasks"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showUserForm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all border border-purple-200">
            <h3 className="text-lg font-semibold mb-4 text-purple-800">✨ Add New User</h3>
            <form onSubmit={createUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-700">Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter user name"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-purple-700">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showTaskForm && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all border border-indigo-200">
            <h3 className="text-lg font-semibold mb-4 text-indigo-800">
              {editingTask ? '✏️ Edit Task' : '✨ Add New Task'}
            </h3>
            <form onSubmit={editingTask ? updateTask : createTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-indigo-700">Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter task title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-indigo-700">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  rows="3"
                  placeholder="Enter task description"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-indigo-700">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">💧 Low</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="high">🔥 High</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-indigo-700">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-indigo-700">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  className="w-full border border-indigo-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
