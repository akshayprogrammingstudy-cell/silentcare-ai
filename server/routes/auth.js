import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const csvPath = path.join(dataDir, 'users.csv');
const sqlPath = path.join(dataDir, 'users.sql');

const BCRYPT_ROUNDS = 10;
// Simple admin secret for protecting data-download endpoints.
// Set ADMIN_SECRET in .env to a strong random value before deploying.
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'silentcare-admin-secret-change-me';

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure CSV file exists with headers
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, 'name,age,country,email,password_hash\n', 'utf8');
}

// Ensure SQL schema exists
if (!fs.existsSync(sqlPath)) {
  fs.writeFileSync(sqlPath,
    '-- SilentCare AI User Registrations Database schema\n' +
    'CREATE TABLE IF NOT EXISTS users (\n' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
    '  name TEXT,\n' +
    '  age INTEGER,\n' +
    '  country TEXT,\n' +
    '  email TEXT UNIQUE,\n' +
    '  password_hash TEXT,\n' +
    '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n' +
    ');\n\n',
    'utf8'
  );
}

// Helper to parse users CSV
const readUsersFromCSV = () => {
  try {
    const data = fs.readFileSync(csvPath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return []; // Header only

    return lines.slice(1).map(line => {
      // Split ignoring commas inside quotes
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

      return {
        name:          cleanParts[0],
        age:           parseInt(cleanParts[1]) || 0,
        country:       cleanParts[2],
        email:         cleanParts[3],
        password_hash: cleanParts[4]
      };
    });
  } catch (err) {
    console.error('Error reading CSV users:', err);
    return [];
  }
};

// Middleware: verify admin secret header for protected routes
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-secret'] || req.query.secret;
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized — admin secret required.' });
  }
  next();
}

/**
 * @route POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  const { name, age, country, email, password } = req.body;

  if (!name || !age || !country || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required signup fields (name, age, country, email, password)'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters.'
    });
  }

  const users = readUsersFromCSV();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return res.status(400).json({
      success: false,
      error: 'An account with this email address already exists.'
    });
  }

  try {
    // Hash password before storing — never store plaintext
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Escape helper for CSV
    const esc = (v) => String(v).replace(/"/g, '""');

    // 1. Write to CSV (store hash, not raw password)
    const csvRow = `"${esc(name)}","${age}","${esc(country)}","${esc(email)}","${esc(password_hash)}"\n`;
    fs.appendFileSync(csvPath, csvRow, 'utf8');

    // 2. Write to SQL (parameterised-style comment kept; hash stored)
    const safeEmail = email.replace(/'/g, "''");
    const safeName  = name.replace(/'/g, "''");
    const safeCountry = country.replace(/'/g, "''");
    const safeHash  = password_hash.replace(/'/g, "''");
    const sqlRow = `INSERT INTO users (name, age, country, email, password_hash) VALUES ('${safeName}', ${parseInt(age)}, '${safeCountry}', '${safeEmail}', '${safeHash}');\n`;
    fs.appendFileSync(sqlPath, sqlRow, 'utf8');

    res.json({
      success: true,
      message: 'User account registered successfully.',
      user: { name, age, country, email }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

/**
 * @route POST /api/auth/signin
 */
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  const users = readUsersFromCSV();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  try {
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: {
        name:    user.name,
        age:     user.age,
        country: user.country,
        email:   user.email
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
});

/**
 * @route GET /api/auth/users/download-csv
 * @protected Requires X-Admin-Secret header
 */
router.get('/users/download-csv', requireAdmin, (req, res) => {
  if (!fs.existsSync(csvPath)) {
    return res.status(404).send('CSV file not found');
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  fs.createReadStream(csvPath).pipe(res);
});

/**
 * @route GET /api/auth/users/download-sql
 * @protected Requires X-Admin-Secret header
 */
router.get('/users/download-sql', requireAdmin, (req, res) => {
  if (!fs.existsSync(sqlPath)) {
    return res.status(404).send('SQL file not found');
  }
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename=users.sql');
  fs.createReadStream(sqlPath).pipe(res);
});

export default router;
