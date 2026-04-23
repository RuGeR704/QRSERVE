# QR-SERVE

> A React Native app to scan, save and organize your QR codes — with categories, search, and instant access to your most used ones.

---

## Overview

QR-SERVE is a cross-platform mobile application built with **React Native** and **Expo**. It allows users to scan any QR code using their device camera, save it to a personal library with a custom title, emoji icon and category, and retrieve it instantly whenever needed.

The home screen surfaces the most frequently used and most recently scanned codes for quick access, while the library screen provides full search and category filtering.

---

## Features

- **Scan QR codes** using the device camera with real-time detection
- **Save QR codes** with a custom title, emoji icon and category
- **Library** with search by title and filter by category
- **Home screen** showing most used (carousel) and most recent (list) QR codes
- **Open links** directly in the browser from within the app
- **Display QR code** on screen in full size for sharing
- **Share** any QR code content via the native share sheet
- **Delete** QR codes from the library
- **Persistent storage** — all data is saved locally on the device

---

## Categories

| Category | Description |
|---|---|
| Wi-Fi | Wireless network credentials |
| Bar Menu | Bar and drink menus |
| Restaurant | Restaurant menus |
| Business Card | Contact information |
| Link | Generic URLs and web links |
| Payment | Payment QR codes |
| Social | Social media profiles |
| Other | Everything else |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile framework |
| Expo SDK 54 | Development platform and build tools |
| Expo Router | File-based navigation |
| Expo Camera | QR code scanning |
| AsyncStorage | Local persistent storage |
| react-native-qrcode-svg | QR code rendering |
| react-native-svg | SVG support for QR rendering |
| TypeScript | Type safety |
| `@expo/vector-icons` | Icons (MaterialIcons) |

---

## Project Structure

```
QR-SERVE/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Home screen
│   │   ├── scanner.tsx      # QR scanner screen
│   │   └── library.tsx      # Library with search and filters
│   └── _layout.tsx          # Root layout
├── components/
│   ├── QRCard.tsx           # Reusable QR code card
│   ├── CategoryBadge.tsx    # Category filter chip
│   └── SearchBar.tsx        # Search input component
├── hooks/
│   └── useQRStorage.ts      # Storage logic (save, get, delete)
├── types/
│   └── qr.ts                # TypeScript interfaces and types
├── constants/
│   └── categories.ts        # Category definitions and metadata
└── assets/                  # Icons and images
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [Expo Go](https://expo.dev/go) app on your iOS or Android device

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/RuGeR704/QRSERVE.git
cd QRSERVE
```

**2. Install dependencies**

```bash
npm install --legacy-peer-deps
```

**3. Start the development server**

```bash
npx expo start --tunnel --clear
```

**4. Open on your device**

- Download **Expo Go** from the App Store or Google Play
- Scan the QR code shown in the terminal with your device camera
- The app will load automatically

> **Note:** Your device and computer must be on the same network, or use `--tunnel` flag for connections across different networks.

---

## Running on Simulators

**iOS Simulator** (macOS only)
```bash
npx expo start --ios
```

**Android Emulator** (requires Android Studio)
```bash
npx expo start --android
```

---

## How to Use

1. **Scan** — tap the Scanner tab and point your camera at any QR code
2. **Save** — enter a title, pick an emoji icon and select a category, then tap Save
3. **Browse** — go to the Library tab to see all your saved QR codes
4. **Search** — use the search bar to find a QR code by title, or tap a category chip to filter
5. **Open** — tap any QR code card to see its details and open the link directly in the browser
6. **Show QR** — tap "Show QR" to display the full QR code on screen
7. **Share** — tap "Share" to send the QR code content via any app

---

## Data Storage

All QR codes are stored locally on the device using **AsyncStorage**. No data is sent to any server. Uninstalling the app will permanently delete all saved QR codes.

---

## Known Limitations

- QR code images are not saved as photos to the camera roll (coming in a future update)
- Wi-Fi QR codes display the raw credential string — automatic Wi-Fi joining is not yet supported
- Dark mode is not yet supported

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

Made by [RuGeR704](https://github.com/RuGeR704)
