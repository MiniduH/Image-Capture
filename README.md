# Image Capture

Lightweight Node.js server for capturing, storing, and managing webcam images through a browser interface.

## Description

Image Capture provides a small, self-hosted web interface and server for capturing images from a user's camera, storing them locally in the `images/` folder, and managing authentication via a simple `users.json` file. It is ideal for demos, local monitoring, and small projects that require browser-based image capture without heavy dependencies.

## Features

- Browser-based camera capture and upload
- Local image storage in `images/`
- Simple username/password management via `users.json`
- Helpful utilities for local development (`generate-cert.js`) and docs for camera flip / network access

## Project Structure

- `server.js` — main Node.js server
- `public/` — static frontend (includes `index.html`, `login.html`)
- `images/` — captured images are saved here
- `users.json` — simple user store for authentication
- `generate-cert.js` — helper to create local self-signed certificates for HTTPS development
- `CAMERA_FLIP.md`, `NETWORK_ACCESS.md` — platform-specific notes

## Prerequisites

- Node.js (16+ recommended)

## Quick Start

1. Install dependencies (if your project uses `package.json`):

   ```bash
   npm install
   ```

2. (Optional) Generate local certificates for HTTPS development:

   ```bash
   node scripts/generate-cert.js
   ```

3. Start the server:

   ```bash
   node server.js
   ```

4. Open the app in your browser and log in via `public/login.html` or `public/index.html`.

## Configuration

- Edit `users.json` to add or update users (user/password pairs used for the demo auth).
- See `CAMERA_FLIP.md` and `NETWORK_ACCESS.md` for camera orientation and cross-device network instructions.

## Security Notes

This project is designed for local or controlled-environment use. Do not expose it publicly without adding proper authentication, HTTPS, input validation, and rate-limiting.

## Contributing

Contributions are welcome. Please open an issue or PR with a description of changes.

## License

Replace this with your preferred license (e.g., MIT).
