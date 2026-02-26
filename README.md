<div align="center">

# 🍽️ NUTRISNAP
### Smart Recipe Finder from Your Ingredients

[![React Native](https://img.shields.io/badge/React_Native-0.75-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Snap Ingredients** • **Get Recipes** • **Start Cooking**

---

</div>

## 📖 Overview

NUTRISNAP is a mobile application designed for students and individuals living alone who want to make the most of their available ingredients. Simply snap a photo of what you have in your kitchen, and NUTRISNAP will suggest recipes you can make, ranked by how well your ingredients match each recipe.

Built with a custom-trained YOLOv8n model for ingredient recognition and a curated database of Nepali and Western recipes, NUTRISNAP helps you discover cooking possibilities without the hassle of manual ingredient entry.

### ✨ Key Features

- 🔐 **User Authentication** - Secure login and session management with Supabase
- 📸 **Ingredient Recognition** - Snap photos to automatically identify ingredients
- 🎯 **Smart Recipe Matching** - Recipes ranked by ingredient match percentage
- 🍲 **Curated Recipe Database** - 30-40 Nepali and Western recipes
- ✏️ **Editable Results** - Refine recognized ingredients before searching
- 📜 **Scan History** - View your last 10-15 ingredient scans
- 📱 **Cross-Platform** - Works on both iOS and Android
- ⚡ **Fast & Lightweight** - Optimized for quick results

## 🎯 How It Works

```mermaid
graph LR
    A[Sign In] --> B[Take Photo]
    B --> C[YOLOv8n Recognition]
    C --> D[Edit Ingredients]
    D --> E[Match Recipes]
    E --> F[View Results]
    F --> G[Start Cooking!]
```

### User Flow

1. **Sign In**
   - Create an account or log in with existing credentials
   - Secure authentication via Supabase

2. **Capture Ingredients**
   - Open the app and tap the camera button
   - Snap a photo of your ingredients
   - AI identifies what's in the image

3. **Review & Refine**
   - Check recognized ingredients
   - Edit or remove any incorrect items
   - Add missing ingredients if needed

4. **Get Recipe Suggestions**
   - View recipes sorted by match percentage
   - Recipes requiring your ingredients appear first
   - Partial matches shown below

5. **Cook Your Meal**
   - Follow step-by-step instructions
   - Access your scan history anytime

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Expo (SDK 52)** - Build and deployment tools
- **React Navigation** - Screen navigation
- **Expo ImagePicker** - Camera and gallery access

### Backend
- **Flask** - Python web framework
- **Supabase** - Database and authentication service
- **YOLOv8n** - Custom-trained object detection model
- **OpenCV** - Image processing
- **NumPy** - Numerical computations

### Data & Storage
- **Supabase** - PostgreSQL database for user data, recipes, and authentication
- **AsyncStorage** - Local history persistence
- **Custom ML Model** - 13 ingredient classes (custom-annotated dataset)

### API Communication
- **Axios** - HTTP client for API requests
- **RESTful API** - Flask backend endpoints
- **Base64 Encoding** - Image transfer format

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio
- Python 3.11+ (for backend)
- Supabase account (for database and authentication)

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Boredoom17/SmartCooking.git
cd SmartCooking/SmartCookingStable
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
   
   Create a `.env` file:
```env
API_URL=http://your-backend-url:5000
EXPO_PUBLIC_API_URL=http://your-backend-url:5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the app**
```bash
npm start
# or
expo start
```

5. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

### Backend Setup

1. **Clone the backend repository**
```bash
git clone https://github.com/Boredoom17/smartcooking-flask-backend.git
cd smartcooking-flask-backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
   
   Create a `.env` file:
```env
FLASK_ENV=development
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
```

5. **Run the server**
```bash
python server.py
```

The backend will start on `http://localhost:5000`

## 📱 Running the App

### Development Mode

**With Expo Go:**
```bash
npm start
```
- Install Expo Go from App Store (iOS) or Play Store (Android)
- Scan the QR code to launch the app

**Note:** Ensure your mobile device and development machine are on the same network.

### Testing API Connection

Test if the backend is accessible:
```bash
cd smartcooking-flask-backend
python test_api.py
```

## 🗂️ Project Structure

```
SmartCooking/
├── SmartCookingStable/          # Frontend application
│   ├── app/                     # App screens
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── index.tsx       # Home/Camera screen
│   │   │   └── history.tsx     # Scan history
│   │   ├── auth/               # Authentication screens
│   │   ├── recipe/             # Recipe details
│   │   └── _layout.tsx         # Root layout
│   ├── components/              # Reusable components
│   │   ├── CameraView.tsx
│   │   ├── RecipeCard.tsx
│   │   └── IngredientList.tsx
│   ├── services/               # API integration
│   │   ├── api.ts             # Backend communication
│   │   └── supabase.ts        # Supabase client
│   ├── types/                  # TypeScript types
│   ├── assets/                 # Images and resources
│   ├── app.json               # Expo configuration
│   ├── package.json           # Dependencies
│   └── .env                   # Environment config
└── README.md

smartcooking-flask-backend/
├── server.py                   # Flask application
├── test_api.py                # API testing script
├── requirements.txt           # Python dependencies
├── .env                       # Backend configuration
└── test_images/              # Sample test images
```

## 🎨 Core Features in Detail

### 🔐 User Authentication & Sessions

- **Supabase Authentication** - Secure user registration and login
- **Session Management** - Persistent user sessions across app restarts
- **User Data Isolation** - Each user's scan history stored separately
- **Secure Token Storage** - Authentication tokens encrypted locally

### 📸 Ingredient Recognition

- Powered by **YOLOv8n** (You Only Look Once v8 Nano)
- Custom-trained on **13 ingredient categories**
- Recognizes common Nepali and Western cooking ingredients
- Fast inference time (~200ms average)
- Bounding box visualization for detected items

**Supported Ingredients (13 total):**
The model is trained to recognize common ingredients like vegetables, fruits that are frequently used in Nepali cuisine.

### 🎯 Recipe Matching System

- **Percentage-based ranking** - Recipes sorted by ingredient match
- **Flexible matching** - Shows recipes even with partial ingredient lists
- **Prioritized display** - Best matches appear first
- **Recipe database** - 30-40 curated recipes (Nepali and Western fusion)

### 📜 History Tracking

- Stores last **10-15 scans** per user
- Quick access to previous ingredient searches
- View what ingredients were detected in each scan
- Persistent across app sessions and devices

## ⚙️ Configuration

### Adjusting API Endpoint

If running backend on a different device or network:

**For local network (device testing):**
```env
# Use your computer's local IP
API_URL=http://192.168.1.100:5000
```

**For production deployment:**
```env
API_URL=https://your-domain.com
```

### Setting Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Create the necessary tables for users, recipes, and scan history
3. Enable authentication in the Supabase dashboard
4. Copy your project URL and keys to the `.env` file

### Camera Permissions

The app automatically requests camera permissions on first use. Make sure to allow camera access when prompted.

## 📊 Supported Ingredients

The current model supports **13 ingredient categories**. This is a demo version with limited ingredient recognition. The model can be expanded with additional training data to support more ingredients.

> **Note:** Ingredient recognition accuracy depends on image quality, lighting conditions, and how clearly ingredients are visible in the photo.

## 🔒 Privacy & Data

- **Secure Authentication** - User credentials managed by Supabase with industry-standard encryption
- **User Data Isolation** - Each user's data (scan history, preferences) stored separately
- **No cloud storage of images** - Ingredient photos processed in real-time, not stored
- **Local session tokens** - Authentication tokens encrypted and stored on device
- **No third-party tracking** - No analytics or data sharing with external services

## 🐛 Known Limitations

- Limited to 13 ingredient categories
- Recognition accuracy varies with lighting and image quality
- Recipe database is relatively small (30-40 recipes)
- History limited to last 10-15 scans per user
- Requires active internet connection for ingredient recognition and authentication

## 🚧 Current Status

**Version:** Demo.Final (v0.9.0)

This is a **demonstration version** developed as a student project. The app showcases core functionality with a limited ingredient database and recipe collection. With additional resources and time, the system can be significantly expanded.

### Potential Improvements
- Expand ingredient recognition to 50+ categories
- Larger recipe database (100+ recipes)
- Cloud sync for cross-device history
- Recipe ratings and favorites
- Shopping list generation
- Offline ingredient recognition
- Nutritional information
- Dietary preference filters
- Social features and recipe sharing

## 🤝 Contributing

This is a student demonstration project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m "Add improvement"`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Developers

**Development Team**
- **Aadarsha Chhetri** - [@Boredoom17](https://github.com/Boredoom17) 
- **Vipassi V** - [@Vipassi-V](https://github.com/Vipassi-V) 

Both developers worked collaboratively on the entire project, contributing to both frontend and backend development.

**Repositories:**
- Frontend: [SmartCooking Mobile App](https://github.com/Boredoom17/SmartCooking)
- Backend: [SmartCooking Flask Backend](https://github.com/Boredoom17/smartcooking-flask-backend)

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics for object detection framework
- Supabase for providing excellent backend infrastructure
- React Native and Expo teams for excellent mobile development tools
- Flask community for lightweight backend framework
- All testers who provided valuable feedback

## 📞 Support

Need help or found a bug?

- 📧 [Open an issue](https://github.com/Boredoom17/SmartCooking/issues) on GitHub
- 📖 Check the [backend repository](https://github.com/Boredoom17/smartcooking-flask-backend) for API documentation
- 💬 Review closed issues for common solutions


<br><br>
<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for smarter cooking decisions

[📱 Frontend Repo](https://github.com/Boredoom17/SmartCooking) • [🔧 Backend Repo](https://github.com/Boredoom17/smartcooking-flask-backend) • [🐛 Report Bug](https://github.com/Boredoom17/SmartCooking/issues)

**Demo Version** • Built by Students • Open for Expansion

</div>
