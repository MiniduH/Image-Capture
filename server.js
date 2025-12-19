const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const os = require('os');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// CORS headers for same-network access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const SAVE_DIR = path.join(__dirname, 'images');
const USERS_FILE = path.join(__dirname, 'users.json');

// Serve images directory
app.use('/images', express.static(SAVE_DIR));

if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

// Load users from JSON file
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { users: [] };
  } catch (err) {
    console.error('Error loading users:', err);
    return { users: [] };
  }
}

// Save users to JSON file
function saveUsers(data) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving users:', err);
    return false;
  }
}

// Authentication endpoint - Login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }
  
  const data = loadUsers();
  const user = data.users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  
  // Create session token (in production, use JWT)
  const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
  
  const userRole = user.role || 'photographer';
  let permissions = {};
  
  if (data.roles && data.roles[userRole] && data.roles[userRole].permissions) {
    permissions = data.roles[userRole].permissions;
  }
  
  console.log(`User login: ${username}, Role: ${userRole}, Permissions:`, permissions);
  
  res.json({
    success: true,
    token: token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: userRole,
      permissions: permissions
    }
  });
});

// Authentication endpoint - Register new user
app.post('/auth/register', (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ success: false, error: 'Username, password, and email required' });
  }
  
  const data = loadUsers();
  
  // Check if user already exists
  if (data.users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, error: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Math.max(...data.users.map(u => u.id), 0) + 1,
    username: username,
    password: password,
    email: email,
    role: 'photographer',
    created: new Date().toISOString().split('T')[0]
  };
  
  data.users.push(newUser);
  
  if (!saveUsers(data)) {
    return res.status(500).json({ success: false, error: 'Failed to save user' });
  }
  
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8').split(':');
    req.userId = decoded[0];
    req.username = decoded[1];
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// Get user permissions
app.get('/auth/permissions', verifyToken, (req, res) => {
  const data = loadUsers();
  const user = data.users.find(u => u.id == req.userId);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  const userRole = user.role || 'photographer';
  const roleData = data.roles && data.roles[userRole] ? data.roles[userRole] : null;
  
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: userRole
    },
    permissions: roleData ? roleData.permissions : {}
  });
});

app.post('/save-image', verifyToken, (req, res) => {
  const base64Data = req.body.image.replace(/^data:image\/png;base64,/, '');
  const customName = req.body.name || `capture_${Date.now()}`;
  
  // Sanitize filename
  const sanitizedName = customName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Check if file exists, if so add timestamp
  let filename = `${sanitizedName}.png`;
  let filePath = path.join(SAVE_DIR, filename);
  let counter = 1;
  
  while (fs.existsSync(filePath)) {
    const timestamp = Date.now();
    filename = `${sanitizedName}_${timestamp}_${counter}.png`;
    filePath = path.join(SAVE_DIR, filename);
    counter++;
  }

  fs.writeFileSync(filePath, base64Data, 'base64');
  res.json({ success: true, filename });
});

app.get('/get-images', verifyToken, (req, res) => {
  fs.readdir(SAVE_DIR, (err, files) => {
    if (err) {
      return res.json({ images: [] });
    }
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
    res.json({ images: imageFiles.sort().reverse() });
  });
});

app.post('/delete-image', verifyToken, (req, res) => {
  const filename = req.body.filename;
  
  // Check user permissions
  const data = loadUsers();
  const user = data.users.find(u => u.id == req.userId);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  const userRole = user.role || 'photographer';
  const roleData = data.roles && data.roles[userRole] ? data.roles[userRole] : null;
  
  if (!roleData || !roleData.permissions.delete_image) {
    return res.status(403).json({ success: false, error: 'Permission denied: Cannot delete images' });
  }
  
  // Prevent directory traversal attacks
  if (filename.includes('..') || filename.includes('/')) {
    return res.json({ success: false, error: 'Invalid filename' });
  }
  
  const filePath = path.join(SAVE_DIR, filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.json({ success: false, error: err.message });
    }
    res.json({ success: true });
  });
});

// Admin: Get all users
app.get('/admin/users', verifyToken, (req, res) => {
  const data = loadUsers();
  const user = data.users.find(u => u.id == req.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  // Return users without passwords
  const users = data.users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role || 'photographer',
    created: u.created
  }));
  
  res.json({ success: true, users: users });
});

// Admin: Delete user
app.delete('/admin/users/:id', verifyToken, (req, res) => {
  const data = loadUsers();
  const admin = data.users.find(u => u.id == req.userId);
  
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  const userId = parseInt(req.params.id);
  const userIndex = data.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  // Prevent deleting the only admin
  if (data.users[userIndex].role === 'admin') {
    const adminCount = data.users.filter(u => u.role === 'admin').length;
    if (adminCount === 1) {
      return res.status(403).json({ success: false, error: 'Cannot delete the only admin' });
    }
  }
  
  data.users.splice(userIndex, 1);
  
  if (saveUsers(data)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Admin: Update user role
app.put('/admin/users/:id', verifyToken, (req, res) => {
  const data = loadUsers();
  const admin = data.users.find(u => u.id == req.userId);
  
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  const userId = parseInt(req.params.id);
  const user = data.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  const { role, email } = req.body;
  
  if (email) {
    // Check if email is already in use
    if (data.users.some(u => u.email === email && u.id !== userId)) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }
    user.email = email;
  }
  
  if (role && ['admin', 'photographer', 'viewer'].includes(role)) {
    user.role = role;
  }
  
  if (saveUsers(data)) {
    res.json({ success: true, user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }});
  } else {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Check for SSL certificates
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

function startServer() {
  const interfaces = os.networkInterfaces();
  let localIPs = ['localhost'];
  let useHTTPS = false;
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIPs.push(iface.address);
      }
    }
  }
  
  // Start HTTPS if certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
      https.createServer(options, app).listen(3000, '0.0.0.0', () => {
        useHTTPS = true;
        console.log('\n=== 🔒 Image Capture Server (HTTPS) ===');
        console.log('Camera works on all devices!\n');
        console.log('Access from:');
        localIPs.forEach(ip => console.log(`  https://${ip}:3000`));
        console.log('\n⚠️  Note: Browser will warn about certificate.');
        console.log('Click "Advanced" and "Proceed" to continue.\n');
      });
    } catch (err) {
      console.error('Error loading certificates:', err);
      startHTTP();
    }
  } else {
    startHTTP();
  }
  
  function startHTTP() {
    http.createServer(app).listen(3000, '0.0.0.0', () => {
      console.log('\n=== 📱 Image Capture Server (HTTP) ===');
      console.log('⚠️  Camera will NOT work on other network devices!\n');
      console.log('Access from:');
      localIPs.forEach(ip => {
        if (ip === 'localhost') {
          console.log(`  http://${ip}:3000  ✅ Camera works`);
        } else {
          console.log(`  http://${ip}:3000  ❌ Camera blocked`);
        }
      });
      console.log('\n📋 To enable camera on network devices, run:');
      console.log('   npm run generate-cert\n');
    });
  }
}

startServer();
