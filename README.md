# NyayaSetu ⚖️

NyayaSetu is a modern judicial compliance and legal assistance platform designed to streamline case management and legal workflows using AI.

## Project Structure

- **`backend/`**: FastAPI server handling the logic, AI integrations (Gemini), and database interactions (Supabase).
- **`frontend/`**: Next.js 14 web application providing a high-fidelity interface for legal professionals.

---

## Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Supabase Account** (for Database & Auth)
- **Google AI Studio Key** (for Gemini AI features)

---

### 1. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Fill in your Supabase credentials, JWT secret, and Gemini API key.

5. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   - Copy `.env.local.example` to `.env.local`.
   - Fill in your Supabase URL, Anon Key, and Backend URL (`http://localhost:8000`).

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## Features

- **AI Case Analysis**: Upload legal documents (PDFs) and get instant summaries and insights.
- **Role-Based Dashboard**: Specialized views for Administrators and Legal Professionals.
- **Secure Authentication**: Integrated Supabase Auth with JWT.
- **Interactive UI**: High-fidelity, responsive design built with Tailwind CSS and Framer Motion.

## Deployment

- **Backend**: Suitable for deployment on Render, Railway, or any Python-compatible VPS.
- **Frontend**: Optimized for Vercel.

---

## Contributing

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
