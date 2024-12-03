const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// Initialize database with default data
db.data ||= { users: [] };

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    if (db.data.users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Save user
    db.data.users.push({
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      calculations: []
    });
    
    await db.write();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.data.users.find(u => u.username === username);
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate age endpoint
app.post('/api/calculate-age', authenticateToken, (req, res) => {
  const { day, month, year } = req.body;
  
  // Parse input date
  const birthDate = new Date(year, month - 1, day);
  const currentDate = new Date();
  
  // Validate date
  if (birthDate > currentDate) {
    return res.status(400).json({ error: 'Date cannot be in the future' });
  }
  
  // Calculate difference
  let years = currentDate.getFullYear() - birthDate.getFullYear();
  let months = currentDate.getMonth() - birthDate.getMonth();
  let days = currentDate.getDate() - birthDate.getDate();
  
  // Adjust for negative months/days
  if (days < 0) {
    months--;
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Save calculation to user's history
  const user = db.data.users.find(u => u.id === req.user.id);
  if (user) {
    user.calculations.push({
      date: new Date().toISOString(),
      input: { day, month, year },
      result: { years, months, days }
    });
    db.write();
  }
  
  res.json({ years, months, days });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
