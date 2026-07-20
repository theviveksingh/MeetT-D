# MeetT&D - Video Calls with Truth or Dare

A full-stack web application that enables users to join video calls with screen sharing and play the classic Truth or Dare game.

## Features

- **Authentication**: Email/password signup, login, logout with JWT
- **Dashboard**: Create rooms, join rooms
- **Video/Audio Calling**: WebRTC peer-to-peer video
- **Screen Sharing**: Share screen with participants
- **Co-host System**: Host can assign co-host before leaving
- **Spin the Bottle**: Animated bottle with participant names
- **Truth/Dare Game**: Random challenges with timer
- **Real-time Sync**: Socket.io for synchronized game state
- **In-Call Chat**: Real-time text chat during video calls
- **Emoji Reactions**: Fun reactions (😂 🔥 ❤️ 💀 👏 ✨ 🤪)
- **Configurable Timer**: 15s, 30s, 45s, 60s options
- **Challenge Categories**: Funny, Bold, Personal, Silly
- **Skip Challenge Vote**: Majority can vote to skip
- **Custom Challenges**: Users create & save personal challenges

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Socket.io
- **Database**: MongoDB
- **Auth**: JWT tokens with bcrypt password hashing

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install:all
```

3. Set up environment variables:

**Server (.env)** - located in `/server`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meettd
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:5173
```

**Client (.env)** - located in `/client`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Development Mode

Run both client and server concurrently:

```bash
npm run dev
```

Or run them separately:

**Server**:
```bash
cd server
npm run dev
```

**Client**:
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173`
The server will be available at `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Sign Up/Login**: Create an account or log in
2. **Dashboard**: Create a new room or join an existing one
3. **Room**: Share the room code with friends to join
4. **Game**: Host starts the game → Bottle spins → Player selected → Truth/Dare choice → Challenge + Timer

## Project Structure

```
/workspace/project
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── ...
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── data/          # Challenge data
│   │   ├── middleware/     # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── socket.js      # Socket.io handlers
│   │   └── index.js       # Server entry point
│   └── ...
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Challenges
- `GET /api/challenges/random` - Get random challenge
- `POST /api/challenges/custom` - Create custom challenge
- `GET /api/challenges/custom` - Get user's custom challenges
- `PUT /api/challenges/custom/:id` - Update custom challenge
- `DELETE /api/challenges/custom/:id` - Delete custom challenge

## License

MIT
