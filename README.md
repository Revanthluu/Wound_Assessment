# Mediwound AI - Hospital Grade Diagnostics

Mediwound AI is a production-ready, AI-powered medical web application designed for accurate wound analysis and comprehensive patient management. By leveraging Google's Gemini Vision AI, the platform provides clinical-grade insights into wound progression, tissue composition, and healing status.

## 🚀 Key Features

- **AI-Powered Wound Analysis**: Automated analysis of wound images to determine granulation, epithelial, slough, and eschar percentages.
- **Role-Based Access Control (RBAC)**: Specialized dashboards for **Doctors**, **Nurses**, and **Patients**.
- **Assessment Tracking**: Detailed longitudinal tracking of wound metrics (dimensions, pain levels, and types).
- **Intelligent Alert System**: Automated detection of potential infections (pus, odor, sepsis) with real-time notifications.
- **Secure Authentication**: JWT-based session management with encrypted password storage.
- **Responsive Analytics**: Visual progress tracking using interactive charts for better clinical decision-making.

S

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server (running)

### 1. Database Setup
Execute the following schema in your MySQL instance:
```sql
CREATE DATABASE woundanalysis;
-- Use the database_schema.sql file for table structures
```

### 2. Backend Configuration
Navigate to the `server` directory:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=woundanalysis
PORT=5001
JWT_SECRET=your_jwt_secret
```
Start the server:
```bash
npm start
```

### 3. Frontend Configuration
Navigate to the root directory:
```bash
npm install
```
Create a `.env.local` file:
```env
VITE_API_URL=http://localhost:5001/api
VITE_GEMINI_API_KEY=your_google_ai_key
```
Start the application:
```bash
npm run dev
```

## 🌐 Deployment (Render)

To deploy this application to **Render**, follow these high-level steps:

1. **Database**: Create a MySQL instance (e.g., on Aiven or Railway) and import `database_schema.sql`.
2. **Backend**:
   - Create a **Web Service** on Render pointing to the `server` directory.
   - Configure environment variables: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, `GEMINI_API_KEY`.
3. **Frontend**:
   - Create a **Static Site** on Render.
   - Set **Build Command** to `npm run build` and **Publish Directory** to `dist`.
   - Configure `VITE_API_URL` (your backend URL + `/api`) and `VITE_GEMINI_API_KEY`.
