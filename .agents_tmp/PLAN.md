# 1. OBJECTIVE

Create "MeetT&D" - a web application enabling users to join video calls with screen sharing, and play a Truth or Dare game. Users authenticate via signup/login, then access a dashboard to create or join rooms. When the host starts the game, a bottle spins with all participants' names. When the bottle stops on a name, that person chooses Truth or Dare, receives a random challenge, and has time to enjoy it. The host can assign co-host status before leaving.

# 2. CONTEXT SUMMARY

**Project Type**: Full-stack web application (React + Node.js/Express + MongoDB)

**Core Features**:
- **Authentication**: Email/password signup, login, logout with JWT
- **Dashboard**: Create rooms, join rooms, room history
- **Video/Audio Calling**: WebRTC peer-to-peer video
- **Screen Sharing**: Host can share screen with participants
- **Co-host System**: Host can assign co-host before leaving
- **Spin the Bottle**: Animated bottle with participant names
- **Truth/Dare Game**: Random challenges with timer
- **Real-time Sync**: Socket.io for synchronized game state
- **In-Call Chat**: Real-time text chat during video calls
- **Emoji Reactions**: Fun reactions (😂 🔥 ❤️ 💀 👏 ✨ 🤪)
- **Configurable Timer**: 15s, 30s, 45s, 60s options
- **Challenge Categories**: Funny, Bold, Personal, Silly, Mixed
- **Skip Challenge Vote**: Majority can vote to skip
- **Custom Challenges**: Users create & save personal challenges

**Key Components**:
- Frontend: React with Tailwind CSS
- Backend: Express.js with Socket.io
- Database: MongoDB for user accounts
- Video: WebRTC with simple-peer library
- Auth: JWT tokens with bcrypt password hashing

# 3. APPROACH OVERVIEW

**Architecture**: Client-server model with WebSocket for game state sync

**Why this approach**:
- MongoDB stores user accounts securely
- JWT provides stateless authentication
- WebRTC provides direct peer-to-peer video (low latency)
- Socket.io ensures synchronized game state across all participants
- React allows dynamic UI updates for bottle animation
- Single-page application for seamless user experience

**Complete User Flow**:
1. **Auth**: User signs up / logs in with email & password
2. **Dashboard**: User sees options to create or join room
3. **Lobby**: Participants join, see each other, host can assign co-host
4. **Video Call**: WebRTC connects all participants
5. **Game**: Host/co-host starts → Bottle spins → Player selected → Truth/Dare choice → Challenge + Timer
6. **Co-host Safety**: Host assigns co-host before leaving → co-host inherits host powers

**Co-host System**:
- Host can select any participant as "co-host"
- Co-host badge appears next to their name
- When host leaves: co-host automatically becomes new host
- Co-host has same powers as host (start game, screen share, kick users)

# 4. IMPLEMENTATION STEPS

### Phase 1: Project Setup & Backend Infrastructure

**Step 1.1 - Initialize Project Structure**
- Create project directories (client, server)
- Initialize npm projects with dependencies
- Configure React with Vite + Tailwind CSS
- Set up MongoDB connection

**Step 1.2 - User Authentication System**
- User model (email, password, displayName, avatar, createdAt)
- Auth routes: POST /api/auth/signup, POST /api/auth/login, GET /api/auth/me
- JWT token generation and middleware verification
- bcrypt password hashing
- Login session persistence

**Step 1.3 - Build Socket.io Server**
- Create Express server with Socket.io
- Implement room management (create/join rooms)
- Define socket events: join-room, leave-room, game-start, bottle-spin, truth-dare-select, challenge-complete, assign-cohost
- Store room state (participants, host, cohost, game status, current player)
- Map users to rooms for authentication

**Step 1.4 - Create Truth/Dare Database**
- JSON file with 50+ Truth questions and 50+ Dare challenges
- Categories for variety (funny, bold, personal, silly)

### Phase 2: Frontend Core Structure

**Step 2.1 - Homepage (Landing Page)**
- Hero section with app branding "MeetT&D"
- Features showcase (video call + Truth or Dare game)
- Toggle between Login and Signup forms
- Email/password inputs with validation
- Form error handling and success messages
- Responsive design

**Step 2.2 - Dashboard Page**
- User profile display (avatar, name)
- "Create Room" button with room settings modal
- "Join Room" input field with room code
- Room history list (recent rooms created/joined)
- Logout button
- Navigation to room when created/joined

**Step 2.3 - Room Lobby (Pre-call)**
- Room code display with copy button
- Current participants list with avatars
- Waiting room state before video starts
- Host badge indicators
- "Start Video" button
- Room settings (max participants, etc.)

**Step 2.4 - Video Call Integration**
- WebRTC setup using simple-peer library
- Video grid displaying all participants
- Audio/video mute controls
- Participant name overlays
- Connection status indicators

**Step 2.5 - Host & Co-host Controls**
- START GAME button (host/cohost only)
- Screen sharing toggle (host/cohost only)
- Assign Co-host dropdown (host only) - select from participants
- "Leave as Host" option - transfers host to cohost if exists
- End game / End room options (host only)
- Kick participant option (host/cohost only)

### Phase 3: Bottle Animation & Game Logic

**Step 3.1 - Spinning Bottle Component**
- SVG/CSS bottle that rotates
- Sync rotation start across all clients via socket
- Random stop position calculation on server
- Smooth deceleration animation

**Step 3.2 - Player Selection Flow**
- Detect which name bottle points to
- Display selected player prominently
- Send event to selected player for choice

**Step 3.3 - Truth/Dare Selection UI**
- Modal/card for selected player
- Two large buttons: "TRUTH" and "DARE"
- Broadcast choice to all participants

### Phase 4: Challenge Display & Timer

**Step 4.1 - Challenge Card Component**
- Full-screen card showing the challenge
- Display player name and challenge type
- Animated reveal of the challenge text

**Step 4.2 - Timer System**
- 30-second countdown (configurable)
- Visual countdown with progress indicator
- Audio cue when time expires
- "Next Round" button after timer ends

**Step 4.3 - Challenge Database Integration**
- Fetch random challenge based on type (truth/dare)
- Avoid repeating challenges in same game
- Display challenge with formatting

### Phase 5: Screen Sharing & Polish

**Step 5.1 - Screen Sharing Implementation**
- WebRTC getDisplayMedia API
- Toggle button for host/cohost
- Replace host video with screen share
- Visual indicator when screen sharing active

**Step 5.2 - UI/UX Polish**
- Responsive design for mobile/desktop
- Smooth animations and transitions
- Participant avatars or initials
- Game status indicators
- Loading states and skeleton screens

**Step 5.3 - Error Handling & Edge Cases**
- Handle participant disconnection mid-game
- Reconnection logic with retry
- Host leaves - auto-transfer to cohost (if assigned)
- Host leaves with no cohost - show "Waiting for host" state
- Empty room auto-cleanup
- Invalid room code handling
- Network disconnection recovery

### Phase 6: In-Call Chat

**Step 6.1 - Chat System**
- Sidebar chat panel toggleable during video call
- Text input with send button
- Real-time message delivery via Socket.io
- Messages show sender name and timestamp
- Unread message badge when chat is minimized
- Auto-scroll to newest messages

### Phase 7: Emoji Reactions

**Step 7.1 - Reaction UI**
- Floating reaction toolbar (😂 🔥 ❤️ 💀 👏 ✨ 🤪)
- Click to send reaction
- Reactions appear as floating bubbles on sender's video
- Reactions fade out after 3 seconds
- Maximum 5 reactions visible at once per participant

**Step 7.2 - Reaction Sync**
- Socket.io event for reaction broadcast
- Reaction data: emoji, senderId, timestamp
- Clean up old reactions on timeout

### Phase 8: Game Settings & Customization

**Step 8.1 - Configurable Timer**
- Room creation modal with timer options
- Timer presets: 15s, 30s, 45s, 60s (default: 30s)
- Timer visible during challenge with circular progress
- Audio notification when time expires
- Option to extend time (+15s) by host/cohost

**Step 8.2 - Challenge Categories**
- Categories: Funny, Bold, Personal, Silly, Mixed
- Room creator selects enabled categories
- Each challenge tagged with category
- Filter display based on selection

**Step 8.3 - No Repeat Logic**
- Track used challenges in current game session
- Server ensures no duplicate challenges
- Reset when new game starts

**Step 8.4 - Skip Challenge Vote**
- "Skip" button appears for all participants during challenge
- Vote counter shows (3/5 voted)
- If majority (>50%) votes skip, challenge is skipped
- Skip count resets each round
- Cannot skip more than twice per game

### Phase 9: Custom Challenges

**Step 9.1 - Challenge Creation UI**
- "Add Challenge" button in dashboard
- Form: Challenge text, Type (Truth/Dare), Category
- Preview before saving
- Edit/Delete own challenges

**Step 9.2 - Custom Challenge Storage**
- MongoDB collection for user challenges
- Link challenges to user ID
- Include in game pool with "user" tag
- Display creator name with challenge

**Step 9.3 - Challenge Management**
- View all custom challenges in profile
- Toggle challenges active/inactive
- Share challenge with friends (copy link)

# 5. TESTING AND VALIDATION

**Success Criteria**:
- Users can signup with email/password
- Users can login and access dashboard
- Dashboard shows create/join room options
- Users can create a room and receive a shareable room code
- Multiple users can join the same room with room code
- Video/audio streams work between all participants
- Host can assign co-host to another participant
- Host can leave and co-host becomes new host
- Host can start the game (START button visible to host/cohost)
- All participants see synchronized bottle spinning animation
- Bottle stops on a random participant name
- Selected participant can choose Truth or Dare
- Random challenge displays for everyone
- Timer counts down and challenge completes
- Game continues with new bottle spin or ends
- Screen sharing works for host/cohost
- Chat messages delivered in real-time
- Emoji reactions appear and fade on videos
- Timer duration configurable in room settings
- Skip vote works with majority rule
- Custom challenges can be created and used in games

**Testing Scenarios**:
1. Signup/Login → verify token stored, dashboard accessible
2. Create room → verify room code generated, appears in history
3. Join room → verify user appears in participant list
4. Assign cohost → verify badge appears, host can leave safely
5. Start game → verify all participants see bottle spin
6. Complete one round → verify challenge display and timer
7. Screen share → verify video updates to screen capture
8. Host leaves with cohost → verify cohost becomes host
9. Host leaves without cohost → verify "waiting for host" state
10. Chat send/receive → verify real-time message delivery
11. Emoji reactions → verify reactions appear and fade
12. Custom timer → verify selected duration used
13. Skip vote → verify majority skip works
14. Custom challenge → verify added to pool and displayed
15. Disconnect/reconnect → verify graceful handling
