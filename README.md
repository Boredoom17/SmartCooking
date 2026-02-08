<div align="center">

# 🍳 SmartCooking Backend
### AI-Powered Recipe API with Vision Intelligence

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)

**Smart Recipe Generation** • **Image Recognition** • **RESTful API**

---

</div>

## 📖 Overview

A Flask-based backend service that powers the SmartCooking mobile app with intelligent recipe generation capabilities. Uses OpenAI's GPT-4 Vision API to analyze ingredient images and generate personalized recipes based on available ingredients, dietary preferences, and cooking constraints.

### ✨ Key Features

- 🤖 **AI Recipe Generation** - Leverages GPT-4 for intelligent recipe creation
- 📸 **Image Analysis** - Computer vision for ingredient identification from photos
- 🎯 **Smart Recommendations** - Personalized recipes based on user preferences
- 🔒 **Secure API** - CORS-enabled RESTful endpoints
- 📝 **Detailed Instructions** - Step-by-step cooking guidance with timing
- 🌱 **Dietary Support** - Accommodates various dietary restrictions and preferences
- ⚡ **Fast Response** - Optimized API calls with efficient processing

## 🎯 API Capabilities

The backend provides intelligent recipe generation through:

- **Ingredient-Based Recipe Creation** - Generate recipes from a list of available ingredients
- **Image Recognition** - Upload photos of ingredients for automatic identification
- **Dietary Customization** - Filter recipes by dietary preferences (vegetarian, vegan, gluten-free, etc.)
- **Portion Adjustment** - Scale recipes for different serving sizes
- **Nutritional Information** - Get estimated calorie and macro breakdowns
- **Cooking Time Estimates** - Realistic prep and cook time calculations

## 🛠️ Tech Stack

### Core Framework
- **Flask** - Lightweight WSGI web application framework
- **Flask-CORS** - Cross-Origin Resource Sharing handling
- **Python 3.9+** - Backend language

### AI & Machine Learning
- **OpenAI API** - GPT-4 and GPT-4 Vision models
- **PIL (Pillow)** - Image processing and manipulation
- **Base64** - Image encoding for API transmission

### Development Tools
- **python-dotenv** - Environment variable management
- **Requests** - HTTP library for API calls

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- Python 3.9 or higher
- pip (Python package manager)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Boredoom17/smartcooking-flask-backend.git
cd smartcooking-flask-backend
```

2. **Create a virtual environment** (recommended)
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

   Or copy from the example file:
```bash
cp .env.example .env
# Then edit .env with your actual API key
```

5. **Start the development server**
```bash
python server.py
```
   
   The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Generate Recipe from Ingredients
```http
POST /generate-recipe
Content-Type: application/json

{
  "ingredients": ["chicken breast", "tomatoes", "garlic", "olive oil"],
  "dietary_preferences": "none",
  "servings": 2,
  "cooking_time": "30 minutes"
}
```

**Response:**
```json
{
  "recipe": {
    "title": "Garlic Tomato Chicken",
    "ingredients": [...],
    "instructions": [...],
    "prep_time": "10 minutes",
    "cook_time": "20 minutes",
    "servings": 2,
    "nutrition": {...}
  }
}
```

### Generate Recipe from Image
```http
POST /generate-recipe-from-image
Content-Type: application/json

{
  "image": "base64_encoded_image_string",
  "dietary_preferences": "vegetarian",
  "servings": 4
}
```

**Response:**
```json
{
  "identified_ingredients": ["tomatoes", "onions", "bell peppers"],
  "recipe": {
    "title": "Roasted Vegetable Medley",
    "ingredients": [...],
    "instructions": [...]
  }
}
```

### Health Check
```http
GET /health

Response: { "status": "healthy", "service": "SmartCooking API" }
```

## 🧪 Testing

Test the API endpoints using the provided test script:

```bash
# Test recipe generation from ingredients
python test_api.py

# Test with custom image
python test_api.py --image ./test_images/ingredients.jpg
```

### Manual Testing with cURL

```bash
# Test recipe generation
curl -X POST http://localhost:5000/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["pasta", "tomatoes", "basil"],
    "dietary_preferences": "vegetarian",
    "servings": 2
  }'
```

## 🗂️ Project Structure
```
smartcooking-flask-backend/
├── server.py              # Main Flask application
├── test_api.py            # API testing script
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── test_images/          # Sample images for testing
│   └── sample.jpg
└── README.md             # This file
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `FLASK_ENV` | Flask environment (development/production) | No |
| `FLASK_DEBUG` | Enable debug mode | No |
| `PORT` | Server port (default: 5000) | No |

### API Rate Limits

- OpenAI API has rate limits based on your subscription tier
- Implement caching for frequently requested recipes
- Consider request throttling for production deployment

## 🚢 Deployment

### Deploy to Production

1. **Set production environment variables**
```bash
export FLASK_ENV=production
export FLASK_DEBUG=False
```

2. **Use a production WSGI server** (Gunicorn recommended)
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 server:app
```

### Deploy to Cloud Platforms

**Heroku:**
```bash
# Install Heroku CLI, then:
heroku create smartcooking-api
heroku config:set OPENAI_API_KEY=your_key_here
git push heroku main
```

**Railway:**
- Connect your GitHub repository
- Add `OPENAI_API_KEY` in environment variables
- Deploy automatically on push

**AWS EC2:**
- Set up EC2 instance with Python
- Clone repository and install dependencies
- Use systemd or supervisor for process management
- Configure nginx as reverse proxy

## 🔒 Security

- ✅ Environment variables for sensitive credentials
- ✅ CORS configured for frontend origins only
- ✅ Input validation on all endpoints
- ✅ Rate limiting (recommended for production)
- ✅ HTTPS enforcement (required for production)
- ✅ API key rotation strategy

**Important:** Never commit your `.env` file or expose your OpenAI API key publicly.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m "Add amazing feature"
```
4. Push to your branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## 🐛 Known Issues

- Large images may take longer to process - consider implementing image compression
- API rate limits may affect concurrent requests during high traffic

Found a bug? [Open an issue](https://github.com/Boredoom17/smartcooking-flask-backend/issues)

## 📈 Future Enhancements

- [ ] Recipe caching with Redis
- [ ] User authentication and saved recipes
- [ ] Recipe rating and feedback system
- [ ] Multi-language support
- [ ] Ingredient substitution suggestions
- [ ] Shopping list generation
- [ ] Meal planning features
- [ ] Integration with nutrition databases (USDA, etc.)
- [ ] WebSocket support for real-time updates
- [ ] Recipe scaling algorithm improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Aadarsha Chhetri**
- GitHub: [@Boredoom17](https://github.com/Boredoom17)
- Frontend Repository: [SmartCooking Mobile App](https://github.com/Boredoom17/SmartCooking)
- Backend Repository: [SmartCooking API](https://github.com/Boredoom17/smartcooking-flask-backend)

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 and Vision API
- **Flask Team** - Excellent web framework
- **Python Community** - Comprehensive libraries and support
- All contributors and testers

## 📞 Support

Need help? Here's how to get support:

- 📧 Open an [issue](https://github.com/Boredoom17/smartcooking-flask-backend/issues)
- 📖 Check the [documentation](https://github.com/Boredoom17/smartcooking-flask-backend#readme)
- 💬 Frontend repo: [SmartCooking](https://github.com/Boredoom17/SmartCooking)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for smarter cooking

[🔧 Backend API](https://github.com/Boredoom17/smartcooking-flask-backend) • [📱 Mobile App](https://github.com/Boredoom17/SmartCooking) • [🐛 Report Bug](https://github.com/Boredoom17/smartcooking-flask-backend/issues)

</div>
