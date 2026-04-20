import React from 'react';

const Graph = ({ tasks }) => {
  // Calculate task statistics
  const taskStats = {
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    total: tasks.length
  };

  const percentages = {
    completed: taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0,
    inProgress: taskStats.total > 0 ? Math.round((taskStats.inProgress / taskStats.total) * 100) : 0,
    pending: taskStats.total > 0 ? Math.round((taskStats.pending / taskStats.total) * 100) : 0
  };

  // Don't render if no tasks
  if (taskStats.total === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-4">
          <span className="mr-2">📊</span> Task Statistics
        </h2>
        <div className="text-center text-gray-500 py-8">
          <span className="text-4xl mb-2 block">📈</span>
          <p>No tasks to display yet. Create some tasks to see statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl border border-indigo-100">
      <h2 className="text-xl font-semibold text-indigo-800 flex items-center mb-6">
        <span className="mr-2">📊</span> Task Statistics
      </h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-4 text-center transform transition-all duration-200 hover:scale-105">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-2xl font-bold text-green-800">{taskStats.completed}</div>
          <div className="text-sm text-green-600">Completed</div>
          <div className="text-xs text-green-500 mt-1">{percentages.completed}%</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4 text-center transform transition-all duration-200 hover:scale-105">
          <div className="text-2xl mb-1">🔄</div>
          <div className="text-2xl font-bold text-blue-800">{taskStats.inProgress}</div>
          <div className="text-sm text-blue-600">In Progress</div>
          <div className="text-xs text-blue-500 mt-1">{percentages.inProgress}%</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg p-4 text-center transform transition-all duration-200 hover:scale-105">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-2xl font-bold text-gray-800">{taskStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-xs text-gray-500 mt-1">{percentages.pending}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span className="font-semibold">{percentages.completed}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
               style={{ width: `${percentages.completed}%` }}>
            {percentages.completed > 10 && (
              <span className="text-xs text-white font-semibold">{percentages.completed}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Task Distribution</h3>
        
        <div className="flex items-center">
          <div className="w-20 text-sm text-gray-600">Completed</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                 style={{ width: `${percentages.completed}%` }}>
              {percentages.completed > 5 && (
                <span className="text-xs text-white font-semibold">{taskStats.completed}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-20 text-sm text-gray-600">In Progress</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                 style={{ width: `${percentages.inProgress}%` }}>
              {percentages.inProgress > 5 && (
                <span className="text-xs text-white font-semibold">{taskStats.inProgress}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-20 text-sm text-gray-600">Pending</div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                 style={{ width: `${percentages.pending}%` }}>
              {percentages.pending > 5 && (
                <span className="text-xs text-white font-semibold">{taskStats.pending}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Tasks */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Tasks</span>
          <span className="text-lg font-bold text-indigo-800">{taskStats.total}</span>
        </div>
      </div>
    </div>
  );
};

export default Graph;