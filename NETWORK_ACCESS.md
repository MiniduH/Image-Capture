# Network Access Setup

## Local Network Access

Your Image Capture app is configured to work across your local network. When you run `npm start`, it will show you all available IP addresses.

### Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Note the IP address** shown in the terminal (e.g., `192.168.1.100:3000`)

3. **From another device on the same network**, open:
   ```
   http://192.168.1.100:3000
   ```

### Camera Access on Network Devices

**Important:** Most modern browsers require HTTPS for camera access on network IPs. There are two options:

#### Option 1: Access from localhost only (Recommended for development)
- Works automatically on the device running the server
- Open `http://localhost:3000` on the same computer

#### Option 2: HTTPS Setup (For network access with camera)

To enable camera access from other network devices, set up HTTPS:

1. **Generate self-signed certificate:**
   ```bash
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

2. **Update server.js** to use HTTPS:
   ```bash
   npm install https
   ```

3. **Then restart the server** - it will detect the cert files and use HTTPS

4. **Access from network device:**
   ```
   https://192.168.1.100:3000
   ```
   (Accept the browser's security warning for self-signed certificate)

### Troubleshooting

**Camera doesn't work from network IP:**
- Use HTTPS instead of HTTP (follow Option 2 above)
- Check if firewall blocks port 3000

**Can't see other devices:**
- Both devices must be on the same WiFi network
- Check if firewall allows local network connections
- Verify the IP address is correct

**Images not loading:**
- Refresh the page
- Check browser console for errors (F12)
