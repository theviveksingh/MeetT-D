import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'customChallenges.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
const initializeFile = (file, initial = []) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
  }
};

initializeFile(USERS_FILE, []);
initializeFile(ROOMS_FILE, []);
initializeFile(CHALLENGES_FILE, []);

export const db = {
  // Users
  users: {
    findOne: async (query) => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      return users.find(u => {
        for (const [key, value] of Object.entries(query)) {
          if (u[key] !== value) return false;
        }
        return true;
      }) || null;
    },
    
    findById: async (id) => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      return users.find(u => u._id === id) || null;
    },
    
    create: async (userData) => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      users.push(userData);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return userData;
    },
    
    findByIdAndUpdate: async (id, update) => {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      const index = users.findIndex(u => u._id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...update };
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return users[index];
      }
      return null;
    }
  },

  // Rooms
  rooms: {
    findOne: async (query) => {
      const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      return rooms.find(r => {
        for (const [key, value] of Object.entries(query)) {
          if (r[key] !== value) return false;
        }
        return true;
      }) || null;
    },
    
    findById: async (id) => {
      const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      return rooms.find(r => r._id === id) || null;
    },
    
    create: async (roomData) => {
      const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      rooms.push(roomData);
      fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
      return roomData;
    },
    
    findByIdAndUpdate: async (id, update) => {
      const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      const index = rooms.findIndex(r => r._id === id);
      if (index !== -1) {
        rooms[index] = { ...rooms[index], ...update };
        fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
        return rooms[index];
      }
      return null;
    },
    
    findOneAndDelete: async (query) => {
      const rooms = JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf-8'));
      const index = rooms.findIndex(r => {
        for (const [key, value] of Object.entries(query)) {
          if (r[key] !== value) return false;
        }
        return true;
      });
      if (index !== -1) {
        const deleted = rooms.splice(index, 1)[0];
        fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
        return deleted;
      }
      return null;
    }
  },

  // Custom Challenges
  customChallenges: {
    find: async (query = {}) => {
      const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
      return challenges.filter(c => {
        for (const [key, value] of Object.entries(query)) {
          if (c[key] !== value) return false;
        }
        return true;
      });
    },
    
    create: async (challengeData) => {
      const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
      challenges.push(challengeData);
      fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
      return challengeData;
    },
    
    findByIdAndUpdate: async (id, update) => {
      const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
      const index = challenges.findIndex(c => c._id === id);
      if (index !== -1) {
        challenges[index] = { ...challenges[index], ...update };
        fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
        return challenges[index];
      }
      return null;
    },
    
    findByIdAndDelete: async (id) => {
      const challenges = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
      const index = challenges.findIndex(c => c._id === id);
      if (index !== -1) {
        const deleted = challenges.splice(index, 1)[0];
        fs.writeFileSync(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
        return deleted;
      }
      return null;
    }
  }
};

export default db;
