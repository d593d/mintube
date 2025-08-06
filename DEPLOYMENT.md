# Deployment Guide

This repository contains a full-stack application with a React frontend and FastAPI backend. This guide covers deploying the frontend to Netlify and setting up the backend.

## 🚀 Frontend Deployment (Netlify)

### Prerequisites
- Netlify account
- GitHub repository connected to Netlify
- Environment variables configured

### Automatic Deployment
1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**: Netlify will automatically detect the `netlify.toml` configuration
3. **Environment Variables**: Set up the following in Netlify dashboard:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_REACT_APP_BACKEND_URL=https://your-backend-api.com
   ```

### Manual Build (for testing)
```bash
cd frontend
npm install
npm run build
```

### Configuration Files
- `netlify.toml`: Main Netlify configuration
- `frontend/public/_redirects`: Backup redirect rules
- `frontend/.env.example`: Environment variables template

## 🔧 Backend Deployment

The Python FastAPI backend needs to be deployed separately. Recommended platforms:

### Option 1: Railway
1. Connect your GitHub repository
2. Set environment variables:
   ```
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=your_database_name
   ```
3. Deploy from the `backend` directory

### Option 2: Render
1. Create a new Web Service
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Configure environment variables

### Option 3: Heroku
1. Create Heroku app
2. Add Python buildpack
3. Set environment variables
4. Deploy with Git

## 🔄 API Integration

After deploying the backend, update the frontend environment variables:

1. **In Netlify Dashboard**:
   - Go to Site settings → Environment variables
   - Update `VITE_REACT_APP_BACKEND_URL` with your backend URL

2. **In netlify.toml**:
   - Update the API proxy redirect URL

3. **In _redirects**:
   - Update the backend URL

## 📊 Database Setup

### MongoDB
1. Set up MongoDB Atlas or use your preferred MongoDB hosting
2. Create a database and get the connection string
3. Update `MONGO_URL` in backend environment variables

### Supabase
1. Create a Supabase project
2. Get your project URL and anon key
3. Update frontend environment variables

## 🧪 Testing the Deployment

1. **Frontend**: Visit your Netlify URL
2. **API**: Test API endpoints at `your-netlify-url.com/api/health`
3. **Database**: Verify database connections in application logs

## 🔍 Troubleshooting

### Build Issues
- Check Node.js version (should be 18+)
- Verify all environment variables are set
- Review build logs in Netlify dashboard

### API Issues
- Ensure backend is deployed and running
- Check CORS configuration in FastAPI
- Verify API proxy redirects are working

### Performance Optimization
- The build is configured with code splitting
- Static assets have long cache headers
- Gzip compression is enabled

## 📝 Environment Variables Summary

### Frontend (Netlify)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

### Backend (Railway/Render/Heroku)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=your_database_name
```

## 🔄 CI/CD

The deployment is set up for automatic builds:
- Push to main branch triggers Netlify rebuild
- Environment variables are managed in Netlify dashboard
- Build optimization is configured in `vite.config.ts`