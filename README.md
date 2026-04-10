# 🔬 SkinCheck — Dermatologist-Style Face Skin Check Application

A comprehensive, production-ready web application that provides professional skin analysis, personalized product recommendations, and customized skincare routines — all powered by a smart assessment engine.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Skin Assessment Engine
- **15-question** comprehensive questionnaire (dermatologist-style)
- **5 skin types** detected: Dry, Oily, Combination, Sensitive, Normal
- **15+ skin conditions** identified: Acne, Eczema, Rosacea, Psoriasis, Hyperpigmentation, Melasma, Fine Lines, Wrinkles, Dark Circles, Enlarged Pores, Blackheads, Whiteheads, Dryness, Flaking, Redness
- **Hydration level** analysis (0–100%)
- **Sensitivity assessment** (Low / Medium / High / Very High)
- **Overall skin health score** with detailed breakdown

### Product Recommendations
- **200+ dermatologist-approved products** in the database
- Smart matching by skin type, concerns, and conditions
- Budget-friendly and premium alternatives
- Products from: CeraVe, La Roche-Posay, The Ordinary, Paula's Choice, EltaMD, Tatcha, Drunk Elephant, and more

### Skincare Routines
- Personalized **AM and PM routines** generated from assessment
- Step-by-step application instructions
- Product sequencing (cleanser → toner → serum → moisturizer → SPF)
- Save and manage multiple routines

### User Features
- JWT-based authentication (register / login)
- Assessment history and progress tracking
- Profile management with avatar upload
- Dark / Light mode support

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS with custom dermatology-themed colors
- Loading states, error handling, form validation
- Accessible navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| File Uploads | Multer |
| Validation | Joi |
| Security | Helmet, express-rate-limit, bcryptjs |

---

## 📁 Project Structure

```
skin-check-app/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Auth business logic
│   │   ├── assessmentController.js
│   │   ├── productController.js
│   │   ├── routineController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Assessment.js
│   │   ├── Product.js
│   │   └── Routine.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assessment.js
│   │   ├── products.js
│   │   ├── routines.js
│   │   └── profile.js
│   ├── seed/
│   │   └── products.js          # 56 seed products
│   ├── utils/
│   │   ├── skinAnalysis.js      # Analysis engine
│   │   ├── recommendations.js   # Recommendation algorithm
│   │   └── routineGenerator.js  # Routine builder
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── PrivateRoute.tsx
    │   │   └── ProductCard.tsx
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── AssessmentPage.tsx
    │   │   ├── ResultsPage.tsx
    │   │   ├── ProductsPage.tsx
    │   │   ├── RoutinePage.tsx
    │   │   └── ProfilePage.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── index.tsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB 5+ (local or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Navanit018/skin-check-app.git
cd skin-check-app
```

### 2. Setup the Backend
```bash
cd backend
npm install

# Copy the environment template and fill in your values
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm run dev
```

### 3. Seed the Product Database
```bash
# While in the backend directory:
npm run seed
```

### 4. Setup the Frontend
```bash
cd ../frontend
npm install
npm start
```

### 5. Open the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## ⚙️ Environment Configuration

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skincheck
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

For the frontend, create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/verify` | Verify JWT token | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

**Register Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "skinProfile": { "skinType": "combination" }
  }
}
```

### Assessment

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/assessment/analyze` | Analyze skin from answers | No |
| GET | `/api/assessment/history` | Get user's history | Yes |
| GET | `/api/assessment/:id` | Get specific assessment | Yes |
| DELETE | `/api/assessment/:id` | Delete assessment | Yes |

**Analyze Request:**
```json
{
  "answers": {
    "q1": "tight",
    "q2": "dry",
    "q3": "rarely",
    "q4": "very-reactive",
    "q5": "rough",
    "q6": "no",
    "q7": "tight",
    "q8": "frequently",
    "q9": "a-few",
    "q10": "dryness",
    "q11": "30s",
    "q12": "4-6",
    "q13": "sometimes",
    "q14": "no",
    "q15": "7-8"
  }
}
```

**Analyze Response:**
```json
{
  "success": true,
  "assessment": {
    "_id": "...",
    "results": {
      "skinType": { "type": "dry", "score": 78 },
      "conditions": [
        { "name": "Dryness", "severity": "moderate", "description": "..." }
      ],
      "hydrationLevel": 35,
      "sensitivityLevel": "high",
      "concerns": ["dryness", "sensitivity"],
      "overallScore": 58
    },
    "recommendations": [...],
    "routine": {
      "morning": [...],
      "evening": [...]
    }
  }
}
```

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (paginated, filtered) | No |
| GET | `/api/products/search?q=cerave` | Search products | No |
| GET | `/api/products/:id` | Get product details | No |
| GET | `/api/products/category/:category` | Products by category | No |
| POST | `/api/products/recommendations` | Personalized recommendations | No |

**Query Parameters for GET /api/products:**
- `page` (default: 1)
- `limit` (default: 20)
- `category` (cleanser/toner/serum/moisturizer/sunscreen/treatment/mask/eye-cream)
- `skinType` (dry/oily/combination/sensitive/normal)
- `concerns` (comma-separated)
- `priceRange` (budget/mid-range/luxury)
- `sort` (rating/-rating/price/-price)

### Routines

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/routines` | Create routine | Yes |
| GET | `/api/routines` | Get user's routines | Yes |
| GET | `/api/routines/:id` | Get specific routine | Yes |
| PUT | `/api/routines/:id` | Update routine | Yes |
| DELETE | `/api/routines/:id` | Delete routine | Yes |

### Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile` | Get user profile | Yes |
| PUT | `/api/profile` | Update profile | Yes |
| POST | `/api/profile/photo` | Upload avatar | Yes |

---

## 🗄️ Database Models

### User
```
name: String (required)
email: String (unique, required)
password: String (hashed, required)
avatar: String
skinProfile: {
  skinType: String
  concerns: [String]
  lastAssessment: Date
}
preferences: {
  notifications: Boolean (default: true)
  darkMode: Boolean (default: false)
}
```

### Assessment
```
user: ObjectId → User
answers: Map<String, String>
results: {
  skinType: { type: String, score: Number }
  conditions: [{ name, severity, description }]
  hydrationLevel: Number (0-100)
  sensitivityLevel: String
  concerns: [String]
  overallScore: Number (0-100)
}
recommendations: [ObjectId → Product]
routine: {
  morning: [RoutineStep]
  evening: [RoutineStep]
}
status: String (pending/complete)
```

### Product
```
name: String
brand: String
category: String (10 categories)
description: String
ingredients: [String]
skinTypes: [String]
concerns: [String]
price: Number
priceRange: String (budget/mid-range/luxury)
rating: Number (0-5)
reviewCount: Number
dermatologistApproved: Boolean
tags: [String]
```

### Routine
```
user: ObjectId → User
name: String
description: String
assessment: ObjectId → Assessment
morning: [RoutineStep]
evening: [RoutineStep]
isActive: Boolean
```

---

## 🚢 Deployment

### Backend (Heroku / Railway / Render)
```bash
# Set environment variables in your platform dashboard:
# MONGODB_URI, JWT_SECRET, NODE_ENV=production, FRONTEND_URL

# Deploy command:
npm start
```

### Frontend (Vercel / Netlify)
```bash
# Set environment variable:
# REACT_APP_API_URL=https://your-api-url.com/api

# Build command:
npm run build

# Publish directory:
build/
```

---

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- For Atlas: whitelist your IP and check connection string format

**JWT Token Issues:**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiry in `JWT_EXPIRE`

**CORS Errors:**
- Ensure `FRONTEND_URL` matches your React app's URL exactly
- Check that backend CORS config lists your frontend origin

**Products Not Showing:**
- Run `npm run seed` in the backend directory first

---

## 📄 License

MIT License — feel free to use this project for personal or commercial purposes.
