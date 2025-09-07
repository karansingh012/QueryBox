# QueryBox AI

A full-stack AI-powered query application built with Python Flask backend and React frontend.

## 🚀 Features

- AI-powered query processing
- Modern React frontend with responsive design
- Python Flask backend with robust API
- Real-time query processing
- Clean and intuitive user interface

## 🛠️ Tech Stack

### Frontend
- **React** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with responsive design

### Backend
- **Python** - Core programming language
- **Flask** - Lightweight web framework
- **Gemini AI** - AI model integration for query processing

## 📁 Project Structure

```
QueryBox/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── api.js           # API communication
│   │   ├── assets/          # Static assets
│   │   └── ...
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                 # Python Flask server
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/QueryBox.git
   cd QueryBox
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env file with your API keys
   python app.py
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## 🔧 Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Add your API keys and configuration:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FLASK_ENV=development
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Mayank Raj**
- Email: rjss2829singh@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to Google Gemini AI for powering the intelligent query processing
- Built with modern web technologies for optimal performance
