import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { createRoom, joinRoom } = useRoom();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    maxParticipants: 10,
    timerDuration: 30,
    categories: ['funny', 'bold', 'personal', 'silly'],
    isPrivate: false
  });

  const categoryOptions = [
    { id: 'funny', label: 'Funny', emoji: '😄' },
    { id: 'bold', label: 'Bold', emoji: '🔥' },
    { id: 'personal', label: 'Personal', emoji: '💭' },
    { id: 'silly', label: 'Silly', emoji: '🤪' }
  ];

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const code = await createRoom(settings);
      navigate(`/room/${code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const code = await joinRoom(roomCode.trim().toUpperCase());
      navigate(`/room/${code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((c) => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-white">MeetT&D</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/challenges"
              className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
            >
              My Challenges
            </a>
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`}
                alt={user?.displayName}
                className="w-10 h-10 rounded-full border-2 border-purple-500"
              />
              <span className="text-white font-medium">{user?.displayName}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome, {user?.displayName}!</h1>
          <p className="text-xl text-gray-300">Ready to play Truth or Dare?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all group"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
            <p className="text-gray-400">Start a new game and invite your friends</p>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
            <p className="text-gray-400">Enter a room code to join an existing game</p>
          </button>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants: {settings.maxParticipants}
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={settings.maxParticipants}
                  onChange={(e) => setSettings({ ...settings, maxParticipants: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timer Duration: {settings.timerDuration}s
                </label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSettings({ ...settings, timerDuration: time })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        settings.timerDuration === time
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Challenge Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        settings.categories.includes(cat.id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={loading || settings.categories.length === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Join Room</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowJoinModal(false); setError(''); setRoomCode(''); }}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={loading || roomCode.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
