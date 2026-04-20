import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Graph from './Graph';

describe('Graph Component', () => {
  test('renders Task Statistics heading', () => {
    const tasks = [];
    render(<Graph tasks={tasks} />);
    const heading = screen.getByText(/Task Statistics/i);
    expect(heading).toBeInTheDocument();
  });

  test('displays no tasks message when tasks array is empty', () => {
    const tasks = [];
    render(<Graph tasks={tasks} />);
    const message = screen.getByText(/No tasks to display yet/i);
    expect(message).toBeInTheDocument();
  });

  test('renders completed task count', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' },
      { id: 2, title: 'Task 2', status: 'pending' }
    ];
    render(<Graph tasks={tasks} />);
    const completedCount = screen.getByText('1');
    expect(completedCount).toBeInTheDocument();
  });

  test('renders in-progress task count', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'in-progress' },
      { id: 2, title: 'Task 2', status: 'pending' }
    ];
    render(<Graph tasks={tasks} />);
    const inProgressCount = screen.getByText('1');
    expect(inProgressCount).toBeInTheDocument();
  });

  test('renders pending task count', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'completed' }
    ];
    render(<Graph tasks={tasks} />);
    const pendingCount = screen.getByText('1');
    expect(pendingCount).toBeInTheDocument();
  });

  test('renders total tasks count', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' },
      { id: 2, title: 'Task 2', status: 'pending' },
      { id: 3, title: 'Task 3', status: 'in-progress' }
    ];
    render(<Graph tasks={tasks} />);
    const totalCount = screen.getByText('3');
    expect(totalCount).toBeInTheDocument();
  });

  test('calculates correct percentages for task statuses', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' },
      { id: 2, title: 'Task 2', status: 'completed' },
      { id: 2, title: 'Task 3', status: 'pending' },
      { id: 3, title: 'Task 4', status: 'in-progress' }
    ];
    render(<Graph tasks={tasks} />);
    
    // 2 completed out of 4 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('renders task distribution section', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' }
    ];
    render(<Graph tasks={tasks} />);
    const distributionHeading = screen.getByText(/Task Distribution/i);
    expect(distributionHeading).toBeInTheDocument();
  });

  test('renders overall progress section', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' }
    ];
    render(<Graph tasks={tasks} />);
    const progressHeading = screen.getByText(/Overall Progress/i);
    expect(progressHeading).toBeInTheDocument();
  });

  test('handles mixed task statuses correctly', () => {
    const tasks = [
      { id: 1, title: 'Task 1', status: 'completed' },
      { id: 2, title: 'Task 2', status: 'in-progress' },
      { id: 3, title: 'Task 3', status: 'pending' }
    ];
    render(<Graph tasks={tasks} />);
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Each status count is 1
    expect(screen.getByText('3')).toBeInTheDocument(); // Total
  });
});
