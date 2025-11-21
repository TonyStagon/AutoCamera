# AutoCamera

A modern, intuitive camera application built with React Native and Expo that lets you capture and crop images with precision. Take a picture, define exactly what matters to you with an interactive crop overlay, and select a subject category for your captured moment.

## Features

- 📸 **Live Camera Preview** - Real-time camera feed with smooth performance
- 🎯 **Interactive Crop Tool** - Drag and resize your crop area with 8-point control
- 💡 **Flash Control** - Toggle between off, on, and auto flash modes
- 🔄 **Camera Flip** - Easily switch between front and back cameras
- 🎨 **Subject Selection** - Categorize your photos by subject (Math, Biology, Physics, Chemistry, History, Geography)
- ✨ **Smooth Animations** - Gesture-based bottom sheet with swipe-to-dismiss

## Getting Started

### Prerequisites

Before running the app, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally with `npm install -g expo-cli`
- An iOS Simulator or Android Emulator set up on your machine

### Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd AutoCamera
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or if using yarn:
   ```bash
   yarn install
   ```

### Running on iOS Simulator

1. **Make sure you have Xcode installed** (available on macOS only)

2. **Start the development server and open in iOS Simulator:**

   ```bash
   npm run ios
   ```

   Or manually:

   ```bash
   expo start
   ```

   Then press `i` to open the iOS Simulator

3. **Access Camera Permissions** - When prompted, grant camera permissions to the app

### Running on Android Emulator

1. **Start an Android Emulator** from Android Studio, or use:

   ```bash
   emulator -avd <your_emulator_name>
   ```

2. **Start the development server and open in Android Emulator:**

   ```bash
   npm run android
   ```

   Or manually:

   ```bash
   expo start
   ```

   Then press `a` to open the Android Emulator

3. **Accept Permissions** - Grant camera permissions when the app requests them

### Web Preview

While web doesn't support camera functionality, you can see the UI:

```bash
npm run web
```

### Available Scripts

```bash
npm start      # Start the Expo development server
npm run ios    # Run on iOS Simulator
npm run android # Run on Android Emulator
npm run web    # Run web preview
```

## How It Works

### 1. **Capture**

Open the app and tap the large circular shutter button to capture a photo. The app will automatically suggest a crop region (60% width, 40% height, centered).

### 2. **Crop**

Once captured, the crop overlay appears with full control:

- **Drag anywhere inside the box** to move the entire crop area
- **Grab the corners** (↖️ ↗️ ↙️ ↘️) to resize diagonally
- **Grab the edges** (↑ ↓ ← →) to resize along a single axis
- The dimmed areas show what will be excluded from your final image

### 3. **Select Subject**

After confirming your crop, a bottom sheet slides up with subject options:

- Swipe down to go back and adjust your crop
- Tap a subject to categorize your image

## Decisions and Tradeoffs

### Crop Overlay Approach

We chose a **visual-first design** for the crop tool rather than preset aspect ratios. Here's why:

**Decision:** All-corner and all-edge resize handles with instant visual feedback

- **Benefit:** Users have maximum control and can see exactly what they're capturing in real-time
- **Tradeoff:** Requires more careful touch interaction compared to simple pinch-zoom, but offers superior precision for document scanning or specific region capture

### Image Handling Strategy

**Decision:** Server-side crop processing via coordinate system

- We store the crop region as mathematical coordinates (x, y, width, height) rather than processing crops on-device
- **Benefit:** Reduces memory footprint on mobile devices and preserves original image quality; enables future server-based enhancements
- **Tradeoff:** Requires backend infrastructure for actual image cropping, which is scalable as the app grows

### Animation Choices

**Decision:** Native Animated API with PanResponder for gesture handling

- We use React Native's built-in animation library instead of third-party libraries
- **Benefit:** Zero external dependencies for core interactions, predictable performance, smaller bundle size
- **Tradeoff:** Less feature-rich than libraries like Reanimated 2, but sufficient for current smooth 60fps gestures

**Decision:** Bottom sheet with swipe-to-dismiss for subject selection

- Keeps the UI clean and provides natural iOS/Android conventions
- **Benefit:** Users immediately understand the interaction model; smooth dismiss gesture prevents accidental selections
- **Tradeoff:** Takes up screen space but provides a natural stopping point in the workflow

## Known Limitations & Future Roadmap

### Current Limitations

1. **No batch processing** - You can only handle one image at a time; app resets after each selection
2. **Fixed subject categories** - The six subjects (Math, Biology, Physics, etc.) are hardcoded; no custom categories
3. **No image export** - Currently, selected images aren't saved or exported; subject selection just logs to console
4. **Limited crop ratios** - Only free-form cropping available; no preset aspect ratios (4:3, 16:9, 1:1, etc.)
5. **No filters or adjustments** - Can't adjust brightness, contrast, or saturation before cropping
6. **Android permissions** - Requires manual permission requests; no graceful degradation if camera access is denied

### What's Next (With More Time)

🎯 **Phase 1: Intelligence Layer**

- Integrate OCR (Optical Character Recognition) to automatically detect and extract text from images
- Implement document edge detection to auto-suggest optimal crop regions for scanned documents
- Add text analysis to understand context and propose relevant subject categories automatically

📊 **Phase 2: AI-Powered Insights**

- Integrate computer vision to analyze image content and suggest the most appropriate subject
- Implement confidence scoring so users know how certain the AI is about its recommendation
- Add multi-subject tagging for images that span multiple categories

💾 **Phase 3: User Experience & Storage**

- Build a local gallery to save captured and cropped images
- Add batch processing to handle multiple photos in one session
- Implement crop history and undo/redo functionality
- Add custom subject management for team or classroom use

🔄 **Phase 4: Advanced Features**

- Preset aspect ratios for different use cases (documents, whiteboards, photos)
- Real-time batch processing with progress indicators
- Cloud sync for accessing cropped images across devices
- Analytics dashboard showing most common subjects and capture patterns

## Tech Stack

- **Framework:** React Native with TypeScript
- **Build System:** Expo (EAS for production builds)
- **Animation:** React Native Animated API
- **Icons:** @expo/vector-icons (Ionicons)
- **Camera:** expo-camera
- **State Management:** React Hooks (useState, useRef)

## Camera Permissions

The app requires camera permissions to function:

- **iOS:** Add permission request in app initialization
- **Android:** Runtime permissions are automatically requested by Expo

## Troubleshooting

**Camera not starting?**

- Verify permissions are granted in device settings
- Restart the app and try again
- Check that your emulator/device has sufficient storage

**Crop handles not responding?**

- Make sure you're tapping directly on the handle (40x40 px area)
- Try increasing your touch precision
- Verify the app isn't running in low-power mode

**Subject selection not working?**

- Confirm you've completed the crop step
- Try force-closing and reopening the app
- Check console logs for any error messages

## Architecture

```
src/
├── screens/
│   ├── CameraLandingScreen.tsx    # Main camera view with crop overlay
│   └── SubjectSelectionScreen.tsx # Bottom sheet for subject picking
App.tsx                             # App entry point
```

## Contributing

This is a personal project. Feel free to fork and create your own version!

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Made with ❤️ and 📸**
