# 🏠 NoBrokerage AI Property Search Chatbot

> An intelligent, GPT-like chat interface for **natural language property search** powered by AI

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)

---

## 📋 Project Overview

**Company:** NoBrokerage.com  
**Task:** AI Engineer Intern Assignment  
**Objective:** Build an intelligent chatbot that understands natural language property queries and returns relevant results with AI-generated summaries.

### 🧩 Problem Statement
Users prefer searching for properties naturally, e.g.  
> “3BHK flat in Pune under ₹1.2 Cr”  
instead of using complicated filters.

### 💡 Solution
A ChatGPT-like interface that:
1. ✅ Understands natural language queries  
2. ✅ Extracts key filters — City, BHK, Budget, Status, Locality  
3. ✅ Searches property data intelligently  
4. ✅ Generates AI-powered summaries (grounded in real data)  
5. ✅ Displays property cards with detailed info  

---

## ✨ Features

### 🔹 Core Functionalities
- **🤖 Natural Language Understanding**
  - OpenAI-powered filter extraction (with regex fallback)
  - Supports City, BHK, Budget, Status, Locality, Project Name
  - Handles Indian currency formats (Cr, Lakhs)

- **🔍 Smart Search & Filtering**
  - Multi-criteria filtering on CSV data
  - Price-range and status-based searches
  - Locality & project-specific filtering

- **📝 AI-Generated Summaries**
  - 3–4 line contextual summaries
  - 100% grounded in CSV data (no hallucination)
  - Graceful fallback when no matches found

- **🏘️ Property Cards**
  - Responsive, clean design
  - Full property details with image fallback
  - Direct links to property pages

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- React 18.2  
- Axios  
- React Icons  
- CSS3 (custom-styled UI)

### ⚙️ Backend
- Node.js 16+  
- Express 4.18  
- CSV Parser for data loading  
- OpenAI API (optional)  
- Helmet & CORS for security

### 💾 Data Layer
- CSV Files (4 datasets)  
- In-memory storage for fast retrieval

---

## 📁 Project Structure
```
nobrokerage-ai-chatbot/
│
├── frontend/
│ ├── public/
│ │ ├── index.html
│ │ ├── manifest.json
│ │ └── favicon.ico
│ │
│ ├── src/
│ │ ├── components/
│ │ │ ├── ChatInterface.jsx
│ │ │ ├── MessageBubble.jsx
│ │ │ ├── PropertyCard.jsx
│ │ │ └── InputBox.jsx
│ │ │
│ │ ├── services/
│ │ │ └── api.js
│ │ │
│ │ ├── styles/
│ │ │ ├── ChatInterface.css
│ │ │ ├── MessageBubble.css
│ │ │ ├── PropertyCard.css
│ │ │ └── InputBox.css
│ │ │
│ │ ├── App.jsx
│ │ ├── App.css
│ │ ├── index.js
│ │ └── index.css
│ │
│ ├── package.json
│ ├── .env
│ └── .env.example
│
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ │ └── chatController.js
│ │ ├── services/
│ │ │ ├── nlpService.js
│ │ │ ├── searchService.js
│ │ │ └── summaryService.js
│ │ ├── utils/
│ │ │ ├── dataLoader.js
│ │ │ ├── filterExtractor.js
│ │ │ └── formatters.js
│ │ ├── routes/
│ │ │ └── chatRoutes.js
│ │ ├── middleware/
│ │ │ ├── errorHandler.js
│ │ │ └── validator.js
│ │ ├── config/
│ │ │ └── config.js
│ │ └── server.js
│ │
│ ├── package.json
│ ├── .env
│ └── .env.example
│
├── data/
│ ├── project.csv
│ ├── ProjectAddress.csv
│ ├── ProjectConfiguration.csv
│ └── ProjectConfigurationVariant.csv
│
├── docs/
│ └── API.md
│
├── tests/
│ ├── unit/
│ │ ├── nlpService.test.js
│ │ └── searchService.test.js
│ └── integration/
│ └── chat.test.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### 🧱 Prerequisites
- Node.js 16+  
- npm  
- Git  
- OpenAI API Key (optional – uses regex fallback if not set)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/shreelfaldu/nobrokerage-ai-chatbot.git
cd nobrokerage-ai-chatbot
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit .env and add your OpenAI API key 
Then start the server:
```bash
npm run dev
```

Backend runs on http://localhost:5000

### 3️⃣ Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend runs on http://localhost:3000

### 4️⃣ Verify CSV Data

Ensure all 4 CSV files exist in /data:

✅ project.csv

✅ ProjectAddress.csv

✅ ProjectConfiguration.csv

✅ ProjectConfigurationVariant.csv

### ⚙️ Configuration

🧩 Backend .env
```bash
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

🧩 Frontend .env
```bash
REACT_APP_API_URL=http://localhost:5000
```
💻 Usage

🗣️ Example Queries

Try asking:

```
“3BHK flat in Pune under ₹1.2 Cr”

“Ready to move 2BHK in Mumbai”

“Under construction properties in Chembur”

“Show me 1BHK apartments under 80 lakhs”

“Pristine02 project details”
```

🧾 Expected Output

```
Summary: Found 6 3BHK properties in Pune within your budget of ₹1.2 Cr.
Top localities include Ravet and Punawale. Prices range from ₹0.79 Cr to ₹1.18 Cr.
2 are ready-to-move and 4 are under construction.
```
(Property cards displayed below summary)

---

📚 API Documentation

See detailed docs here → docs/API.md

Quick Reference
```
| Method | Endpoint    | Description     |
| :----- | :---------- | :-------------- |
| `GET`  | `/health`   | Health check    |
| `POST` | `/api/chat` | Send chat query |
```

🧪 Testing

✅ Run Backend Tests
```
cd backend
npm test
```
---

### 🧭 Manual Testing

Start backend & frontend

Visit http://localhost:3000

Enter sample queries

Validate property cards and summaries

### 🎥 Demo

🔹 **Live Demo:** [View Project on Azure](https://icy-pond-07bb02000.3.azurestaticapps.net/)  

🔹 **Video Demo:** [Watch on Google Drive](https://drive.google.com/file/d/1CaXzeXIXTgw-CAqU4o7549scUGXBLUoS/view?usp=sharing) 

🔹 **GitHub Repository:** [nobrokerage-ai-chatbot](https://github.com/Shreelfaldu/nobrokerage-ai-chatbot)


## 👤 Author

**Shreel Faldu**  
📧 [shreel.faldu23@example.com](mailto:shreel.faldu23@example.com)  
🔗 [GitHub @shreelfaldu](https://github.com/shreelfaldu)



⭐ If you found this project interesting, consider giving it a star!
