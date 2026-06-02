# PEHCHAN 👁️
### Personnel Entry & Human-resource Check-in through Hybrid AI Network

[![Version](https://img.shields.io/badge/version-1.0.1-blue)](https://github.com/vashita-pandey/PEHCHAN/releases)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green)](https://github.com/vashita-pandey/PEHCHAN)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB)](https://reactnative.dev)
[![TFLite](https://img.shields.io/badge/TensorFlow%20Lite-2.12.0-FF6F00)](https://tensorflow.org/lite)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

> Offline biometric attendance system for field personnel. Works in zero-network zones using on-device AI.

## 📥 Download

**[⬇️ Download PEHCHAN v1.0.1 APK](https://github.com/vashita-pandey/PEHCHAN/releases/download/v1.0.1/app-release.apk)**

> Android 8.0+ required. Enable "Install unknown apps" in settings before installing.

---

## 🎯 Problem Statement

Field personnel in remote locations need to mark attendance without internet connectivity. Traditional systems fail in zero-network zones. PEHCHAN solves this with fully offline facial recognition and liveness detection.

---

## ✨ Features

- 🔒 **Fully Offline** — No internet required for authentication
- 👁️ **Face Recognition** — MobileFaceNet with 99.5% accuracy
- 🎭 **Liveness Detection** — Two-stage anti-spoofing (passive + active challenge)
- 👥 **Employee Management** — Enroll with name, ID, department, designation
- 📋 **Attendance Log** — Date-wise records with sync status
- 🌐 **Auto Sync** — Firebase Firestore sync when network restored
- 🗑️ **Data Purge** — Local data purged after successful sync
- 🇮🇳 **Hindi/English** — Full bilingual support
- ⚡ **Fast** — End-to-end authentication in ~200ms
- 📱 **Lightweight** — 4.6 MB AI models (target was 20 MB)

---

## 📊 Performance Benchmarks

| Metric | Result | Target |
|--------|--------|--------|
| AI Model Size | **4.6 MB** | ~20 MB |
| Face Recognition Inference | **131ms** | < 200ms |
| Liveness Detection | **45ms** | < 200ms |
| End-to-end Authentication | **~200ms** | < 1000ms |
| Face Recognition Accuracy | **99.5%** (LFW) | > 95% |
| Liveness Detection Accuracy | **98.2%** | > 90% |
| Min Android Version | **Android 8.0** | Android 8.0+ |

---

## 🏗️ Architecture
Camera Frame (VisionCamera)
↓
Native Bridge (Kotlin/JSI)
↓
┌─────────────────────────────────┐
│        TFLite Inference         │
│  BlazeFace (229 KB) + MobileFaceNet (4.4 MB)  │
│  CLAHE Lighting Normalization   │
│  L2-Normalized Embeddings       │
└─────────────────────────────────┘
↓
Two-Stage Liveness Detection
(Passive texture + Active challenge)
↓
Cosine Similarity Matching (threshold: 0.30)
↓
AsyncStorage (Encrypted local DB)
↓
Firebase Firestore (when online)

---

## 🤖 AI Models

| Model | Purpose | Size | Source |
|-------|---------|------|--------|
| BlazeFace | Face detection | 229 KB | MediaPipe |
| MobileFaceNet (INT8) | Face recognition | 4.4 MB | Custom trained |
| MiniFASNet-style | Liveness detection | Passive + Active | Custom |

### Model Innovations
- **INT8 Quantization** — 4x size reduction with <1% accuracy loss
- **CLAHE Normalization** — Handles harsh sunlight, shadows, low light
- **L2 Normalization** — Consistent embedding comparison across devices
- **Two-stage Liveness** — Passive-first (zero friction) + Active fallback

---

## 📱 Screens

| Screen | Description |
|--------|-------------|
| Splash | PEHCHAN branding with AI model loading |
| Home | Dashboard with today's stats and quick actions |
| Attendance | Auto-identify and mark attendance via face scan |
| Enroll | Register new employee with form + face capture |
| Employees | Directory with search and delete |
| Attendance Log | Date-wise records with sync status |
| Settings | Language toggle, sync, clear data |
| Benchmark | Live performance test against hackathon targets |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74.5 |
| Language (Android) | Kotlin |
| Language (iOS) | Swift |
| AI Runtime | TensorFlow Lite 2.12.0 |
| Camera | react-native-vision-camera v4 |
| Navigation | React Navigation 6 |
| Storage | AsyncStorage |
| Cloud Sync | Firebase Firestore |
| Network | @react-native-community/netinfo |
| i18n | i18next + react-i18next |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+
- JDK 17
- Android Studio + SDK API 34+
- React Native CLI

### Android
```bash
git clone https://github.com/vashita-pandey/PEHCHAN.git
cd PEHCHAN
npm install
npx react-native run-android
```

### iOS (requires macOS)
```bash
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## ☁️ Firebase Configuration

Replace the config in `src/services/FirebaseService.ts` with your own Firebase project credentials.

Set up Firestore with collection `attendance` in test mode for development.

---

## 🔐 Security Notes

- Face embeddings stored locally as 128-dimensional float vectors
- No raw face images persisted on device
- AES encryption on local storage
- Data purged after successful cloud sync
- API keys should be moved to environment variables in production

---

## 📁 Project Structure
PEHCHAN/
├── android/
│   └── app/src/main/
│       ├── assets/
│       │   ├── face_detection.tflite    # BlazeFace (229 KB)
│       │   └── face_recognition.tflite  # MobileFaceNet (4.4 MB)
│       └── java/com/datalakeauth/
│           ├── TFLiteModule.kt          # Native inference bridge
│           └── TFLitePackage.kt         # RN package registration
├── ios/
│   ├── TFLiteModule.swift               # iOS Swift bridge
│   └── TFLiteModule.m                   # ObjC bridge header
└── src/
├── i18n/index.ts                    # Hindi/English translations
├── screens/
│   ├── SplashScreen.tsx
│   ├── HomeScreen.tsx
│   ├── AttendanceScreen.tsx         # Core auth screen
│   ├── EnrollScreen.tsx
│   ├── EmployeesScreen.tsx
│   ├── AttendanceLogScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── LivenessScreen.tsx
│   └── BenchmarkScreen.tsx
└── services/
├── TFLiteBridge.ts             # JS-Native bridge
├── StorageService.ts           # Local persistence
├── SyncService.ts              # Network + sync logic
└── FirebaseService.ts          # Firestore upload

---

## 🏆 Hackathon 7.0

Built for **Hackathon 7.0** — *"Develop a mobile based secure offline facial recognition and liveness detection system for remote locations"*

- **Submission:** June 5, 2026
- **Category:** AI/ML + Mobile Development
- **Team:** Vashita Pandey

---

## 📄 License

MIT — All dependencies are open source. No additional licenses required.