<div align="center">

# 🌸 Perfumes Store

**A full-stack web application for browsing and managing a luxury perfume catalog**

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

---

## 📖 Overview

Perfumes Store is a full-stack web application that allows users to explore a curated catalog of luxury perfumes, leave reviews, and manage their accounts. Administrators have access to a dedicated dashboard to manage brands, products, and users.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://reactjs.org/) | 18.2 | UI library |
| [Vite](https://vitejs.dev/) | 4.4 | Build tool & dev server |
| [React Router DOM](https://reactrouter.com/) | 6.x | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com/) | 3.3 | Utility-first styling |
| [Axios](https://axios-http.com/) | 1.x | HTTP client |
| [@react-oauth/google](https://github.com/MomenSherif/react-oauth) | 0.12 | Google OAuth2 login |
| [jwt-decode](https://github.com/auth0/jwt-decode) | 4.x | JWT token decoding |
| [Lucide React](https://lucide.dev/) | — | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | — | Runtime environment |
| [Express.js](https://expressjs.com/) | 4.18 | Web framework |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | 7.5 | Database & ODM |
| [JSON Web Token (JWT)](https://jwt.io/) | 9.x | Authentication & session |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.x | Password hashing |
| [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) | 9.x | Google OAuth2 verification |
| [dotenv](https://github.com/motdotla/dotenv) | 16.x | Environment configuration |
| [CORS](https://github.com/expressjs/cors) | 2.x | Cross-origin resource sharing |

---

## ✨ Features

### 👤 Authentication & Authorization
- **Register** with email, username, full name, gender, and year of birth
- **Login** with email/password
- **Google OAuth 2.0** single sign-on
- **JWT-based sessions** — tokens expire in 30 minutes
- **Inactivity auto-logout** — automatically logs out after 30 minutes of no user activity
- **Session expiry detection** — prompts user to re-login when token expires
- **Role-based access control** — `member` and `admin` roles with protected routes

### 🛍️ Perfume Catalog
- Browse all perfumes with a clean, responsive grid layout
- **Search & filter** perfumes by name or brand
- **Featured perfumes** section highlighted on the home page
- Detailed perfume page showing:
  - Name, brand, price, concentration, volume
  - Target audience & description
  - Ingredients list
  - User reviews and ratings

### ⭐ Reviews & Ratings
- Authenticated users can **leave a comment and rating** (1–3 stars) on any perfume
- **One review per user per perfume** enforced at the database level
- View all community reviews on the perfume detail page

### 👤 User Profile
- View and update personal information (full name, gender, year of birth)
- Change password securely using bcrypt hashing
- Profile page accessible only when logged in

### 🔧 Admin Dashboard
Access restricted to `admin` role only.

- **Manage Brands** — Create, update, and delete perfume brands
- **Manage Perfumes** — Full CRUD for perfume entries including images, pricing, concentration, description, and ingredients
- **Manage Collectors (Users)** — View all registered users and manage their accounts

---

## 🗂️ Project Structure

```
Perfumes-Store/
├── BE/                         # Backend (Node.js + Express)
│   ├── server.js               # App entry point
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Brand.js
│   │   ├── Perfume.js
│   │   └── Feedback.js
│   ├── routes/                 # API route handlers
│   │   ├── auth.js
│   │   ├── brands.js
│   │   ├── perfumes.js
│   │   ├── users.js
│   │   └── feedback.js
│   ├── middleware/             # Auth middleware
│   │   ├── auth.js             # JWT verification
│   │   └── adminAuth.js        # Admin role guard
│   └── scripts/               # Utility scripts
│
└── FE/                         # Frontend (React + Vite)
    └── src/
        ├── App.jsx             # Root component & routes
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── page/               # Page-level components
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Profile.jsx
        │   ├── Perfumes.jsx
        │   ├── PerfumesDetail.jsx
        │   ├── Admin.jsx
        │   ├── ManageBrands.jsx
        │   ├── ManagePerfumes.jsx
        │   └── ManageCollectors.jsx
        ├── components/         # Reusable UI components
        ├── hooks/              # Custom React hooks
        └── services/
            └── api.js          # Axios API service layer
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- A Google OAuth2 Client ID (for Google login)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Perfumes-Store.git
cd Perfumes-Store
```

### 2. Configure environment variables

Create a `.env` file inside the `BE/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/perfumes_store
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:5173
```

### 3. Install dependencies & run

**Backend:**
```bash
cd BE
npm install
npm run dev
```

**Frontend:**
```bash
cd FE
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | — |
| `POST` | `/api/auth/login` | Login with email/password | — |
| `POST` | `/api/auth/google` | Login with Google OAuth | — |
| `GET` | `/api/perfumes` | Get all perfumes | — |
| `GET` | `/api/perfumes/:id` | Get perfume by ID | — |
| `POST` | `/api/perfumes` | Create perfume | Admin |
| `PUT` | `/api/perfumes/:id` | Update perfume | Admin |
| `DELETE` | `/api/perfumes/:id` | Delete perfume | Admin |
| `GET` | `/api/brands` | Get all brands | — |
| `POST` | `/api/brands` | Create brand | Admin |
| `PUT` | `/api/brands/:id` | Update brand | Admin |
| `DELETE` | `/api/brands/:id` | Delete brand | Admin |
| `GET` | `/api/users` | Get all users | Admin |
| `PUT` | `/api/users/:id` | Update user info | Member |
| `POST` | `/api/feedback` | Submit a review | Member |

---

<div align="center">
Made with ❤️ — Perfumes Store
</div>