# DatalakeAuth — Offline Face Recognition & Liveness Detection

![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue)
![TFLite](https://img.shields.io/badge/TensorFlow%20Lite-2.12.0-orange)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Overview
DatalakeAuth is a lightweight, fully offline facial recognition and liveness detection system built for the Datalake 3.0 React Native app. It authenticates field personnel in zero-network zones using on-device AI inference.

---

## Key Metrics
| Metric | Our Result | Hackathon Target |
|--------|-----------|-----------------|
| AI Model Size | 4.6 MB | ~20 MB |
| End-to-end Auth | < 200ms | < 1000ms |
| Face Recognition Accuracy | 99.5% (LFW) | > 95% |
| Liveness Detection Accuracy | 98.2% | > 90% |
| Min Android Version | Android 8.0 (API 26) | Android 8.0+ |
| APK Size (Release) | 28 MB | — |

---

## Architecture
Camera Frame
↓
VisionCamera (React Native)
↓
Native Bridge (JSI)
↓
┌─────────────────────────────┐
│     TFLite Inference        │
│  ┌──────────┐ ┌──────────┐  │
│  │ BlazeFace│ │MobileFace│  │
│  │ 229 KB   │ │Net 4.4MB │  │
│  └──────────┘ └──────────┘  │
└─────────────────────────────┘
↓
Cosine Similarity Matching
↓
AsyncStorage (Encrypted Local DB)
↓
AWS Sync (when network restored)

---

## Models Used
| Model | Purpose | Size | Accuracy |
|-------|---------|------|----------|
| BlazeFace | Face detection | 229 KB | — |
| MobileFaceNet (INT8) | Face recognition | 4.4 MB | 99.5% LFW |
| MiniFASNet-style | Liveness detection | Passive + Active | 98.2% |

---

## Features
- ✅ Fully offline — no internet required for authentication
- ✅ Real-time face detection and recognition
- ✅ Two-stage liveness detection (passive texture + active challenge)
- ✅ CLAHE lighting normalization for outdoor conditions
- ✅ L2-normalized face embeddings with cosine similarity
- ✅ AES-encrypted local storage
- ✅ Auto-sync to AWS when network restored
- ✅ Local data purge after successful sync
- ✅ Performance benchmark screen

---

## Tech Stack
- **Framework:** React Native 0.74.5
- **AI Runtime:** TensorFlow Lite 2.12.0
- **Camera:** react-native-vision-camera v4
- **Storage:** @react-native-async-storage/async-storage
- **Network:** @react-native-community/netinfo
- **Language (Android):** Kotlin
- **Language (iOS):** Swift

---

## Project Structure
DatalakeAuth/
├── android/
│   └── app/src/main/
│       ├── assets/
│       │   ├── face_detection.tflite    # BlazeFace model
│       │   └── face_recognition.tflite  # MobileFaceNet model
│       └── java/com/datalakeauth/
│           ├── TFLiteModule.kt          # Native TFLite bridge
│           └── TFLitePackage.kt         # React Native package
├── ios/
│   ├── TFLiteModule.swift               # iOS TFLite bridge
│   ├── TFLiteModule.m                   # Objective-C bridge
│   ├── face_detection.tflite
│   └── face_recognition.tflite
└── src/
├── screens/
│   ├── CameraScreen.tsx             # Main auth screen
│   ├── LivenessScreen.tsx           # Liveness challenge
│   ├── AttendanceScreen.tsx         # Attendance log
│   └── BenchmarkScreen.tsx          # Performance tests
└── services/
├── TFLiteBridge.ts              # JS-Native bridge
├── StorageService.ts            # Local storage
└── SyncService.ts              # AWS sync

---

## Android Setup

### Prerequisites
- Node.js 20+
- JDK 17
- Android Studio
- Android SDK API 34+

### Installation
```bash
# Clone repo
git clone https://github.com/vashita-pandey/DatalakeAuth.git
cd DatalakeAuth

# Install dependencies
npm install

# Run on Android
npx react-native run-android
```

---

## iOS Setup

### Prerequisites
- macOS with Xcode 14+
- CocoaPods
- Apple Developer account

### Installation
```bash
# Install dependencies
npm install

# Install iOS pods
cd ios && pod install && cd ..

# Run on iOS
npx react-native run-ios
```

---

## AWS Sync Configuration
Replace the placeholder URL in `src/services/SyncService.ts`:
```typescript
const AWS_ENDPOINT = 'https://your-api-gateway-url.amazonaws.com/prod/attendance';
```

Set up AWS infrastructure:
1. API Gateway → Lambda → DynamoDB
2. Cognito for device authentication
3. S3 for optional face image backup

---

## Performance Benchmarks
Tested on OnePlus Nord CE3 (Snapdragon 782G, 8GB RAM):

| Test | Result |
|------|--------|
| Model initialization | 8ms |
| Face detection | < 10ms |
| Face recognition inference | 131ms |
| Liveness detection | 45ms |
| End-to-end authentication | < 200ms |

---

## Liveness Detection
Two-stage anti-spoofing:
1. **Passive:** Texture analysis detects flat surfaces (photos, screens)
2. **Active:** Random challenge from {blink, smile, turn left, turn right}

Defeats: printed photos, screen replays, static images.

---

## License
MIT — All dependencies are open source, no additional licenses required.