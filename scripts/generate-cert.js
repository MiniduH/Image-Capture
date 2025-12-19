const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certPath = path.join(__dirname, '..', 'cert.pem');
const keyPath = path.join(__dirname, '..', 'key.pem');

// Check if certificates already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ Certificates already exist!');
  console.log('Run: npm start\n');
  process.exit(0);
}

console.log('🔐 Generating self-signed SSL certificate...\n');
console.log('This enables camera access from other network devices.\n');

try {
  // Generate self-signed certificate valid for 365 days
  const command = `openssl req -x509 -newkey rsa:4096 -nodes -out "${certPath}" -keyout "${keyPath}" -days 365 -subj "/CN=localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Certificate generated successfully!\n');
  console.log('📋 Next steps:');
  console.log('1. Start the server: npm start');
  console.log('2. Open in browser: https://[your-ip]:3000');
  console.log('3. Click "Advanced" when browser warns about certificate');
  console.log('4. Click "Proceed to localhost" (or your IP)\n');
  console.log('Camera will now work on all network devices! 📱\n');
  
} catch (error) {
  console.error('❌ Error generating certificate:');
  console.error(error.message);
  console.error('\nMake sure OpenSSL is installed:');
  console.error('  Ubuntu/Debian: sudo apt-get install openssl');
  console.error('  Mac: brew install openssl');
  console.error('  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html\n');
  process.exit(1);
}
