const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();

// Add CORS middleware
app.use(cors());

// Add body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add SQLite connection
const db = new sqlite3.Database('mydatabase.sqlite');

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    password TEXT,
    phone TEXT
  )
`);

// Add your routes here
app.get('/users', (req, res) => {
  // Retrieve users from database
  const sql = 'SELECT * FROM users';
  db.all(sql, (err, rows) => {
    if (err) throw err;
    // Send the list of users as a JSON response
    res.json(rows);
  });
});

app.post('/signup', (req, res) => {
  // Get the user data from the request body
  const { name, email, password, phone } = req.body;

  // Insert the user data into the database
  const sql = `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, email, password, phone], (err) => {
    if (err) throw err;
    // Send a success message as a JSON response
    const message = { success: true, message: 'User created successfully' };
    res.json(message);
  });
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  // Check if the email and password exist in the database
  const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(sql, [email, password], (err, row) => {
    if (err) throw err;

    // If the user exists in the database, send their information as a JSON response
    if (row) {
      const user = {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
      };
      res.json(user);
    } else {
      // If the user does not exist in the database, send an error message as a JSON response
      const message = { success: false, message: 'Invalid email or password' };
      res.status(401).json(message);
    }
  });
});

app.post('/forgot-password', (req, res) => {
  // Logic to handle forgot password request
  const message = { success: true, message: 'Password reset instructions sent to your email' };

  // Send the message object as a JSON response
  res.json(message);
});

// Start the server
app.listen(3001, () => {
  console.log('Server is listening on port 3001');
});