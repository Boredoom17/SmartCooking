# NutriSnap

**AI-Powered Vegetable Detection & Nepali Recipe Recommender**

NutriSnap is an intelligent mobile application that uses computer vision to identify vegetables from user-captured photos and suggests relevant **Nepali recipes**, helping reduce household food waste while promoting culinary creativity and discovery.

<p align="center">
  <img src="https://via.placeholder.com/800x400.png?text=NutriSnap+App+Screenshots" alt="NutriSnap Screenshots" width="80%" />
  <br/>
  <em>Coming soon: Demo screenshots / video</em>
</p>

## ✨ Key Features

- 📸 **Snap** a photo of your vegetables using the device camera
- 🤖 **AI Detection** — automatically recognizes 14 common vegetables
- 🍲 **Recipe Suggestions** — personalized Nepali recipes in **English** and **Nepali**
- ⭐ **Favorites** — save recipes for quick access later
- ♻️ Helps reduce food waste by utilizing ingredients you already have

### Supported Vegetables (14 classes)

Tomato · Cauliflower · Capsicum · Potato · Ginger · Garlic · Cabbage · Pumpkin · Eggplant · Onion · Peas · Radish · Carrot · Spinach

## 🛠 Tech Stack

| Layer              | Technology                            |
|--------------------|---------------------------------------|
| **Mobile**         | React Native (CLI) + TypeScript       |
| **AI / ML**        | YOLOv8n (Ultralytics), PyTorch        |
| **Backend**        | Flask (Python)                        |
| **Database & Auth**| Supabase (PostgreSQL + Auth)          |
| **Training**       | Google Colab                          |
| **Camera**         |  vision-camera   |

## 📊 Model Performance

- **mAP@50** — 72.2%  
- **Inference time** — ~6.3 ms (on suitable mobile hardware)  
- **Training dataset** — 2,229 annotated images across 14 classes

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 8
- Python ≥ 3.12
- Android Studio (for Android builds) or Xcode (for iOS)
- Supabase account & project

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Boredoom17/SmartCooking.git
   cd SmartCooking/SmartAICooking


2. Install frontend dependencies
   ```bash
    npm install
    # or
    yarn install
  
3. Set up environment variables
   ```bash
   cp .env.example .env
  Fill in your Supabase credentials and backend API URL in .env


4. (Optional) Backend setup
   ```bash
   cd backend          # or wherever your Flask app lives
   python -m venv venv
   source venv/bin/activate    # Windows: venv\Scripts\activate
   pip install -r requirements.txt

5. Run the mobile app
   ```bash
   npm run android
   # or
   npm run ios

For detailed build troubleshooting, Supabase integration, or Flask server setup → see SETUP.md
<br><br>


<br><br>
🤝 Contributing<br><br>
We welcome contributions of all kinds!<br><br>

1.Fork the repository<br>
2.Create your feature branch<br>
     git checkout -b feature/amazing-feature<br>
3.Commit your changes<br>
     git commit -m 'Add amazing feature'<br>
4.Push to the branch<br>
     git push origin feature/amazing-feature<br>
5.Open a Pull Request<br>
<br>
Please read CONTRIBUTING.md (create if missing) for detailed guidelines.

<br><br><br>
❤️ Acknowledgments<br><br>

-Supervisor: Mr. Suraj Khattri, Oxford College, Butwal<br>
-Institution: Bachelor of Information Management (BIM), Tribhuvan University, Nepal <br>
-Guidance & Support: Oxford College Butwal and Tribhuvan University<br>
<br>

📄 License <br>
This project is licensed under the MIT License — see the LICENSE file for details. <br>

Developed with ❤️ by<br>
Aadarsha Chhetri<br>
Vipassi Kumar Bajracharya<br>
