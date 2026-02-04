NutriSnap
AI-powered vegetable detection and recipe recommendation system
An intelligent mobile application that identifies vegetables from images and suggests relevant Nepali recipes to reduce food waste and enhance culinary discovery.

About
NutriSnap uses computer vision to automatically detect vegetables from user-captured photos and recommends recipes based on available ingredients. The app addresses household food waste by helping users discover recipes they can make with ingredients they already have.
Key Features:

📸 Snap a photo of your vegetables
🤖 AI automatically detects 14 types of vegetables
🍳 Get recipe suggestions in English & Nepali
⭐ Save your favorite recipes

Supported Vegetables (14):
Tomato, Cauliflower, Capsicum, Potato, Ginger, Garlic, Cabbage, Pumpkin, Eggplant, Onion, Peas, Radish, Carrot, Spinach

Tech Stack

Mobile: React Native, TypeScript
AI/ML: YOLOv8n, PyTorch, Google Colab
Backend: Flask (Python), Supabase (PostgreSQL)
Authentication: Supabase Auth


Getting Started
Prerequisites

Node.js 18+
Python 3.12+
Android Studio or Xcode

Installation

Clone the repository

bashgit clone https://github.com/yourusername/nutrisnap.git
cd nutrisnap

Install mobile app dependencies

bashcd SmartCookingStable
npm install

Set up environment variables

bashcp .env.example .env
# Add your Supabase and API URLs

Run the app

bashnpm run android  # or npm run ios
For detailed setup instructions, see SETUP.md.

Model Performance
Our YOLOv8n model achieves:

72.2% mAP50 accuracy
6.3ms inference time
Trained on 2,229 images across 14 vegetable classes


Contributing
We welcome contributions! Whether it's:

🐛 Bug fixes
✨ New features
📝 Documentation improvements
🎨 UI/UX enhancements

How to contribute:

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request


Team
Developed by:

Aadarsha Chhetri
Vipassi Kumar Bajracharya

Supervised by:

Suraj Khattri, Oxford College, Butwal

Institution:
Bachelor of Information Management (BIM)
Tribhuvan University, Nepal

License
This project is licensed under the MIT License - see LICENSE for details.

Acknowledgments
Special thanks to Oxford College Butwal, Tribhuvan University, and our supervisor Mr. Suraj Khattri for their guidance and support throughout this project.
