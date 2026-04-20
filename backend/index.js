import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDatabase = async () => {
  try {
    console.log('Connecting to database...');
    
    await pool.connect();
    console.log('Database connected successfully!');
    
    console.log('🔍 Checking database tables...');
    
    // Check if users table exists
    console.log('Checking users table...');
    const usersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!usersTableCheck.rows[0].exists) {
      console.log('❌ Users table not found - Creating...');
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table already exists');
    }

    // Check if tasks table exists
    console.log('Checking tasks table...');
    const tasksTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks'
      );
    `);
    
    if (!tasksTableCheck.rows[0].exists) {
      console.log('❌ Tasks table not found - Creating...');
      await pool.query(`
        CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(50) DEFAULT 'medium',
          due_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tasks table created successfully');
    } else {
      console.log('✅ Tasks table already exists');
    }

    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ DATABASE NOT CONNECTED');
    console.error('Connection failed:', error.message);
    console.error('Please check your database credentials in .env file');
    console.log('⚠️  Server will continue running but database operations will fail');
  }
};

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM tasks t JOIN users u ON t.user_id = u.id';
    let params = [];
    
    if (userId) {
      query += ' WHERE t.user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { userId, title, description, priority, due_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description, priority || 'medium', due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // First check if the task exists and belongs to the user
    const taskCheck = await pool.query(
      'SELECT user_id FROM tasks WHERE id = $1',
      [id]
    );
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (taskCheck.rows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ error: 'You can only edit your own tasks' });
    }
    
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, description, status, priority, due_date, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // First check if the task exists and belongs to the user
    const taskCheck = await pool.query(
      'SELECT user_id FROM tasks WHERE id = $1',
      [id]
    );
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (taskCheck.rows[0].user_id !== parseInt(userId)) {
      return res.status(403).json({ error: 'You can only delete your own tasks' });
    }
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, async () => {
  await initDatabase();
  console.log(`Server running on port ${port}`);
});