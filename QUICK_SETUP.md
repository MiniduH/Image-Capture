# Quick Setup for Network Camera Access

## Problem
Camera is blocked when accessing from other devices on your network because HTTP is not secure enough for camera access.

## Solution - 3 Simple Steps

### Step 1: Generate SSL Certificate (One time only)

```bash
npm run generate-cert
```

This creates a self-signed certificate that makes the connection secure (HTTPS).

### Step 2: Start the Server

```bash
npm start
```

You'll see something like:
```
=== 🔒 Image Capture Server (HTTPS) ===
Camera works on all devices!

Access from:
  https://localhost:3000
  https://192.168.1.100:3000

⚠️  Note: Browser will warn about certificate.
Click "Advanced" and "Proceed" to continue.
```

### Step 3: Access from Other Devices

On another device connected to the **same WiFi**:

1. Open browser and go to: `https://192.168.1.100:3000` (use your IP shown above)
2. Browser will show a warning about the certificate
3. Click "Advanced" → "Proceed anyway" or "Accept Risk"
4. ✅ Camera now works!

## Troubleshooting

**Q: Certificate generation failed?**
- Make sure OpenSSL is installed
- Ubuntu: `sudo apt-get install openssl`
- Mac: `brew install openssl`

**Q: Still no camera access?**
- Devices must be on **same WiFi network**
- Check firewall settings for port 3000
- Try refreshing the page
- Check browser console (F12) for errors

**Q: Certificate warning when opening?**
- This is normal for self-signed certificates
- Click "Advanced" and accept the risk
- Your data is still secure on your local network

## What's Happening?

- **HTTP (Without HTTPS)**: Browsers block camera access for security
- **HTTPS (With Certificate)**: Browsers allow camera access
- **Self-signed Certificate**: Works fine for local networks, safe to use

Your certificate is only used locally and never sent online. 🔒
