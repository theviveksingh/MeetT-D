# MeetT&D Deployment Plan

## Overview
Deploy the MeetT&D full-stack application (React + Express + MongoDB) so it's accessible online at a public URL.

## Architecture
```
Internet → Frontend (Vercel) → Backend (Railway/Render) → MongoDB Atlas
```

---

## Step 1: Prepare MongoDB (Database)

### Option A: MongoDB Atlas (Recommended - Free Tier)
1. Go to https://www.mongodb.com/atlas
2. Create free account → New Cluster
3. Region: Choose closest to users
4. Create Database User (username/password)
5. Network Access: Add `0.0.0.0/0` for IP whitelist
6. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/meettd`

### Option B: Use Existing MongoDB
If you have an existing MongoDB instance, note the connection URI.

---

## Step 2: Deploy Backend (Express Server)

### Option A: Railway (Recommended - Free $5/month)
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select `theviveksingh/MeetT-D`
5. Add Environment Variables:
   - `PORT`: 3000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate random 32+ char string
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Railway will auto-detect Node.js and run `npm start`
7. Note the deployment URL (e.g., `https://meettd-backend.up.railway.app`)

### Option B: Render (Free Tier)
1. Go to https://render.com
2. Sign up → New Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `cd server && npm start`
   - Plan: Free
5. Add Environment Variables (same as Railway)
6. Note deployment URL

### Option C: Fly.io (Free Tier)
```bash
fly launch
fly secrets set MONGODB_URI="your-mongodb-uri"
fly secrets set JWT_SECRET="your-secret"
fly secrets set CLIENT_URL="your-frontend-url"
fly deploy
```

---

## Step 3: Update Server Code for Production

Create `/server/src/index.js` with proper CORS and production settings:
```javascript
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
```

---

## Step 4: Deploy Frontend (React/Vercel)

### Vercel (Recommended - Free)
1. Go to https://vercel.com
2. Sign up with GitHub
3. New Project → Import `theviveksingh/MeetT-D`
4. Framework: Vite
5. Root Directory: `./client`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://meettd-backend.up.railway.app`)
   - `VITE_SOCKET_URL`: Your backend URL (e.g., `https://meettd-backend.up.railway.app`)
9. Deploy!
10. Note your frontend URL (e.g., `https://meettd.vercel.app`)

### Alternative: Netlify
1. Build command: `npm run build`
2. Publish directory: `client/dist`
3. Add same environment variables

---

## Step 5: Configure CORS and Environment

### Update Server (`/server/src/index.js`)
```javascript
const CLIENT_URL = process.env.CLIENT_URL; // Set after frontend deploys

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
```

### Update Client Environment Variables
After deploying backend, set in Vercel:
```
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

---

## Step 6: Update Socket.io Client

Update `/client/src/utils/socket.js`:
```javascript
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

---

## Step 7: Final Deployment Checklist

- [ ] MongoDB Atlas cluster created with user
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables configured (with backend URL)
- [ ] Update server `CLIENT_URL` to frontend URL
- [ ] Test full flow:
  - [ ] User signup/login
  - [ ] Create/join room
  - [ ] Video/audio connection
  - [ ] Socket.io game sync
  - [ ] Challenge display

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free Tier | $0 |
| Railway | Starter (500 hrs/mo) | $0 |
| Vercel | Hobby | $0 |
| **Total** | | **$0/month** |

---

## Custom Domain (Optional)

### Vercel
1. Project Settings → Domains
2. Add `meettd.com` or `play.meettd.com`
3. Update DNS records as instructed

### Railway
1. Settings → Networking → Add Custom Domain
2. Configure DNS

---

## Monitoring & Logs

- Railway: Dashboard → Deployment → View Logs
- Vercel: Dashboard → Deployment → Function Logs
- MongoDB Atlas: Metrics dashboard

---

## Estimated Time: 30-45 minutes
