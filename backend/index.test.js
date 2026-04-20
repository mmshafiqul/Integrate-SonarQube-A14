import request from 'supertest';

// Mock the pg module
const mockPool = {
  connect: jest.fn(() => Promise.resolve()),
  query: jest.fn()
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Import app after mocking
import app from './index.js';

describe('Backend API Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status when database is connected', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
    });

    it('should return unhealthy status when database connection fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database connection failed'));
      
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(503);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database).toBe('disconnected');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-02' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockUsers });
      
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(mockUsers);
    });

    it('should return 500 on database error', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'Test User', email: 'test@example.com' };
      const createdUser = { id: 1, ...newUser, created_at: '2024-01-01' };
      mockPool.query.mockResolvedValue({ rows: [createdUser] });
      
      const response = await request(app)
        .post('/api/users')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
    });

    it('should return 500 on database error', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test', email: 'test@example.com' });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending', user_name: 'John', user_email: 'john@example.com' },
        { id: 2, title: 'Task 2', status: 'completed', user_name: 'Jane', user_email: 'jane@example.com' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockTasks });
      
      const response = await request(app).get('/api/tasks');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter tasks by userId', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending', user_name: 'John', user_email: 'john@example.com' }
      ];
      mockPool.query.mockResolvedValue({ rows: mockTasks });
      
      const response = await request(app).get('/api/tasks?userId=1');
      
      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE t.user_id = $1'),
        [1]
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        userId: 1,
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        due_date: '2024-12-31'
      };
      const createdTask = { id: 1, ...newTask, status: 'pending', created_at: '2024-01-01' };
      mockPool.query.mockResolvedValue({ rows: [createdTask] });
      
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updatedTask = {
        id: 1,
        title: 'Updated Task',
        description: 'Updated description',
        status: 'completed',
        priority: 'high',
        due_date: '2024-12-31'
      };
      
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
        .mockResolvedValueOnce({ rows: [updatedTask] });
      
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ ...updatedTask, userId: 1 });
      
      expect(response.status).toBe(200);
    });

    it('should return 404 if task not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      const response = await request(app)
        .put('/api/tasks/999')
        .send({ userId: 1, title: 'Updated' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 403 if user does not own the task', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
      
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ userId: 1, title: 'Updated' });
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You can only edit your own tasks');
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'Updated' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User ID is required');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });
      
      const response = await request(app)
        .delete('/api/tasks/1')
        .query({ userId: 1 });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });

    it('should return 404 if task not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });
      
      const response = await request(app)
        .delete('/api/tasks/999')
        .query({ userId: 1 });
      
      expect(response.status).toBe(404);
    });

    it('should return 403 if user does not own the task', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ user_id: 2 }] });
      
      const response = await request(app)
        .delete('/api/tasks/1')
        .query({ userId: 1 });
      
      expect(response.status).toBe(403);
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app).delete('/api/tasks/1');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User ID is required');
    });
  });

  describe('GET /api/tasks/user/:userId', () => {
    it('should return tasks for a specific user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending', user_id: 1 },
        { id: 2, title: 'Task 2', status: 'completed', user_id: 1 }
      ];
      mockPool.query.mockResolvedValue({ rows: mockTasks });
      
      const response = await request(app).get('/api/tasks/user/1');
      
      expect(response.status).toBe(200);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [1]
      );
    });
  });
});
