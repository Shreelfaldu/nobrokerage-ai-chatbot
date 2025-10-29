# 🏠 NoBrokerage AI Property Search Chatbot

> An intelligent, GPT-like chat interface for natural language property search powered by AI

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)

## 📋 Project Overview

**Company:** NoBrokerage.com  
**Task:** AI Engineer Intern Assignment  
**Objective:** Build an intelligent chatbot that understands natural language property queries and returns relevant results with AI-generated summaries.

### Problem Statement
Users want to search for properties naturally, like "3BHK flat in Pune under ₹1.2 Cr" instead of using complex filters.

### Solution
A ChatGPT-like interface that:
1. ✅ Understands natural language queries
2. ✅ Extracts filters (City, BHK, Budget, Status, Locality)
3. ✅ Searches CSV data intelligently
4. ✅ Generates AI-powered summaries (grounded in data only)
5. ✅ Displays property cards with complete details

---

## ✨ Features

### Core Functionalities

- **🤖 Natural Language Understanding**
  - OpenAI-powered filter extraction (with regex fallback)
  - Supports City, BHK, Budget, Status, Locality, Project Name
  - Handles Indian currency format (Cr, Lakhs)

- **🔍 Smart Search & Filtering**
  - Multi-criteria filtering on CSV data
  - Price range filtering
  - Status-based search (Ready to Move / Under Construction)
  - Locality and project-specific search

- **📝 AI-Generated Summaries**
  - 3-4 sentence contextual summaries
  - 100% grounded in CSV data (no hallucinations)
  - Graceful fallback for no results

- **🏘️ Property Cards**
  - Beautiful, responsive cards
  - Complete property details
  - Direct links to property pages
  - Image support with fallbacks

---

## 🛠️ Tech Stack

### Frontend
- **React.js** 18.2 - UI library
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Custom styling

### Backend
- **Node.js** 16+ - Runtime environment
- **Express.js** 4.18 - Web framework
- **CSV Parser** - Data loading
- **OpenAI API** - NLP processing (optional)
- **Helmet** - Security middleware
- **CORS** - Cross-origin support

### Data Layer
- **CSV Files** - Property database (4 files)
- **In-memory storage** - Fast data retrieval

---

## 📁 Project Structure
''
nobrokerage-ai-chatbot/
│
├── frontend/                                    
│   ├── public/                                  
│   │   ├── index.html                         
│   │   ├── manifest.json                      
│   │   └── favicon.ico                         
│   │
│   ├── src/                                     
│   │   ├── components/                          
│   │   │   ├── ChatInterface.jsx              
│   │   │   ├── MessageBubble.jsx              
│   │   │   ├── PropertyCard.jsx               
│   │   │   └── InputBox.jsx                   
│   │   │
│   │   ├── services/                            
│   │   │   └── api.js                         
│   │   │
│   │   ├── styles/                              
│   │   │   ├── ChatInterface.css              
│   │   │   ├── MessageBubble.css              
│   │   │   ├── PropertyCard.css               
│   │   │   └── InputBox.css                   
│   │   │
│   │   ├── App.jsx                            
│   │   ├── App.css                            
│   │   ├── index.js                           
│   │   └── index.css                          
│   │
│   ├── package.json                            
│   ├── .env                                    
│   └── .env.example                            
│
├── backend/                                     
│   ├── src/                                     
│   │   ├── controllers/                         
│   │   │   └── chatController.js              
│   │   │
│   │   ├── services/                            
│   │   │   ├── nlpService.js                  
│   │   │   ├── searchService.js               
│   │   │   └── summaryService.js              
│   │   │
│   │   ├── utils/                               
│   │   │   ├── dataLoader.js                  
│   │   │   ├── filterExtractor.js             
│   │   │   └── formatters.js                  
│   │   │
│   │   ├── routes/                              
│   │   │   └── chatRoutes.js                  
│   │   │
│   │   ├── middleware/                          
│   │   │   ├── errorHandler.js                
│   │   │   └── validator.js                   
│   │   │
│   │   ├── config/                              
│   │   │   └── config.js                      
│   │   │
│   │   └── server.js                          
│   │
│   ├── package.json                            
│   ├── .env                                    
│   └── .env.example                            
│
├── data/                                        
│   ├── project.csv                             
│   ├── ProjectAddress.csv                      
│   ├── ProjectConfiguration.csv                
│   └── ProjectConfigurationVariant.csv         
│
├── docs
│   └── API.md                                 
│
├── tests/                                       
│   ├── unit/                                    
│   │   ├── nlpService.test.js                  
│   │   └── searchService.test.js               
│   └── integration/                             
│       └── chat.test.js                        
│
├── .gitignore                                  
└── README.md                                   
             
''

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git
- OpenAI API key (optional - uses regex fallback if not provided)

### 1. Clone Repository
'''
git clone https://github.com/shreelfaldu/nobrokerage-ai-chatbot.git
cd nobrokerage-ai-chatbot
'''

### 2. Backend Setup
'''
cd backend
npm install
cp .env
'''

Edit .env and add your OpenAI API key
'''
npm run dev
'''


Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
Open a new terminal:
'''
cd frontend
npm install
cp .env.example .env
npm start
'''

Frontend runs on: `http://localhost:3000`

### 4. Verify CSV Data
Ensure all 4 CSV files are in the `data/` folder:
- ✅ project.csv
- ✅ ProjectAddress.csv
- ✅ ProjectConfiguration.csv
- ✅ ProjectConfigurationVariant.csv

---

## ⚙️ Configuration

### Backend Environment Variables (`.env`)
''
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
''

### Frontend Environment Variables (`.env`)
''
REACT_APP_API_URL=http://localhost:5000
''

---

## 💻 Usage

### Example Queries

Try these natural language queries:

1. **"3BHK flat in Pune under ₹1.2 Cr"**
2. **"Ready to move 2BHK in Mumbai"**
3. **"Under construction properties in Chembur"**
4. **"Show me 1BHK apartments under 80 lakhs"**
5. **"Pristine02 project details"**

### Expected Output
Summary: Found 6 3BHK properties in Pune within your budget of ₹1.2 Cr.
Top localities include Ravet and Punawale. Prices range from ₹0.79 Cr
to ₹1.18 Cr. 2 are ready-to-move and 4 are under construction.

[Property Cards Display]


---

## 📚 API Documentation

See detailed API documentation: [docs/API.md](docs/API.md)

**Quick Reference:**
- `GET /health` - Health check
- `POST /api/chat` - Send chat query

---

## 🧪 Testing

### Run Backend Tests
'''
cd backend
npm test
'''

### Manual Testing
1. Start backend and frontend
2. Open `http://localhost:3000`
3. Try the sample queries above
4. Verify property cards display correctly

---

## 🎥 Demo

**Live Demo:** [Your Deployment URL]  
**Video Demo:** [Loom Video Link]  
**GitHub Repository:** [This Repo]

---

## 👥 Author

**Your Name**  
- GitHub: [@shreelfaldu](https://github.com/shreelfaldu)
- Email: shreel.faldu23@example.com

---

## 🙏 Acknowledgments

- NoBrokerage.com for the assignment
- OpenAI for GPT models
- React and Node.js communities

