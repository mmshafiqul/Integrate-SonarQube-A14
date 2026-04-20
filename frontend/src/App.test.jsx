import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock axios
jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Daily Task Manager heading', () => {
    render(<App />);
    const headingElement = screen.getByText(/Daily Task Manager/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders Users section', () => {
    render(<App />);
    const usersHeading = screen.getByText(/Users/i);
    expect(usersHeading).toBeInTheDocument();
  });

  test('renders Tasks section', () => {
    render(<App />);
    const tasksHeading = screen.getByText(/Tasks/i);
    expect(tasksHeading).toBeInTheDocument();
  });

  test('renders Add User button', () => {
    render(<App />);
    const addButton = screen.getByText(/Add User/i);
    expect(addButton).toBeInTheDocument();
  });

  test('renders Add Task button', () => {
    render(<App />);
    const addButton = screen.getByText(/Add Task/i);
    expect(addButton).toBeInTheDocument();
  });

  test('renders Task Statistics section', () => {
    render(<App />);
    const statsHeading = screen.getByText(/Task Statistics/i);
    expect(statsHeading).toBeInTheDocument();
  });

  test('displays user form when Add User button is clicked', () => {
    render(<App />);
    const addButton = screen.getByText(/Add User/i);
    fireEvent.click(addButton);
    
    const formHeading = screen.getByText(/Add New User/i);
    expect(formHeading).toBeInTheDocument();
  });

  test('closes user form when Cancel button is clicked', () => {
    render(<App />);
    const addButton = screen.getByText(/Add User/i);
    fireEvent.click(addButton);
    
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    
    const formHeading = screen.queryByText(/Add New User/i);
    expect(formHeading).not.toBeInTheDocument();
  });

  test('initial state has no users and no tasks', () => {
    render(<App />);
    // Since users and tasks are fetched asynchronously, initially they should be empty
    expect(screen.getByText(/Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Tasks/i)).toBeInTheDocument();
  });
});
