# Camera Flip Feature

## What's New

✅ **Front/Back Camera Toggle** - Switch between front and back cameras with a single click

## How to Use

1. **Look for the Flip Button** - In the Live Camera section, there's a "🔄 Flip" button next to the video
2. **Click to Switch** - Click the button to toggle between:
   - **Front Camera** (default) - Selfie/facing camera
   - **Back Camera** - Main/rear camera
3. **Works on Desktop & Mobile** - Supports any device with multiple cameras

## Features

- **Smooth Transition** - Camera switches without interrupting the video stream
- **Error Handling** - If a camera isn't available, shows error message
- **Quick Capture** - Capture images from either camera
- **Responsive** - Button fits nicely in the layout on all screen sizes

## Technical Details

- Uses `facingMode` constraint: `'user'` for front, `'environment'` for back
- Properly stops old stream before starting new one (prevents resource leaks)
- Resolution maintained at 1280x720 (ideal)
- Works with all modern browsers that support WebRTC

## Keyboard Shortcut

Coming soon: Spacebar to flip camera (optional enhancement)

## Troubleshooting

**Flip button doesn't work?**
- Device might only have one camera
- Browser might not have permission for camera
- Check console (F12) for detailed error messages

**Image quality differs between cameras?**
- Different cameras have different specs
- This is normal behavior

**Device gets hot after flipping?**
- Stop using after you're done (stream will continue)
- Refresh page to reset camera stream
