import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import Bottle from '../components/Bottle';
import Challenge from '../components/Challenge';
import VideoGrid from '../components/VideoGrid';
import Chat from '../components/Chat';
import Participants from '../components/Participants';

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    room,
    participants,
    isHost,
    isCohost,
    gameState,
    selectedPlayer,
    leaveRoom,
    startGame,
    spinBottle,
    selectTruthDare
  } = useRoom();

  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!room) {
      navigate('/dashboard');
    }
  }, [room, navigate]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/dashboard');
  };

  const canControlGame = isHost || isCohost;

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-lg font-bold text-white">MeetT&D</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Room:</span>
              <span className="text-white font-mono font-bold text-lg tracking-wider">{room.roomCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(room.roomCode)}
                className="p-1 rounded hover:bg-white/10 transition-all"
                title="Copy room code"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gameState.isActive && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Game Active
              </span>
            )}
            {isHost && (
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">Host</span>
            )}
            {isCohost && (
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">Co-Host</span>
            )}
            <button
              onClick={handleLeave}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex gap-4">
          <div className="flex-1 flex flex-col">
            <VideoGrid participants={participants} roomCode={roomCode} />

            <div className="mt-4 flex items-center justify-center gap-4">
              {!gameState.isActive && canControlGame && participants.length >= 2 && (
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Start Game
                </button>
              )}

              {gameState.isActive && canControlGame && !selectedPlayer && (
                <button
                  onClick={spinBottle}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all animate-pulse"
                >
                  Spin the Bottle!
                </button>
              )}
            </div>
          </div>

          <div className="w-80 flex flex-col gap-4">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 flex-1 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Participants ({participants.length})</h3>
              </div>
              <div className="p-4 overflow-y-auto max-h-64">
                <Participants />
              </div>
            </div>

            {gameState.isActive && selectedPlayer && !gameState.currentChallenge && (
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl border border-purple-500/30 p-6">
                <h3 className="text-white text-center text-xl font-bold mb-4">
                  {selectedPlayer.userId === user._id ? "It's your turn!" : `${selectedPlayer.displayName}'s turn!`}
                </h3>
                {selectedPlayer.userId === user._id && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => selectTruthDare('truth')}
                      className="flex-1 py-4 rounded-xl bg-blue-500 text-white font-bold text-xl hover:bg-blue-600 transition-all"
                    >
                      TRUTH
                    </button>
                    <button
                      onClick={() => selectTruthDare('dare')}
                      className="flex-1 py-4 rounded-xl bg-pink-500 text-white font-bold text-xl hover:bg-pink-600 transition-all"
                    >
                      DARE
                    </button>
                  </div>
                )}
              </div>
            )}

            {gameState.currentChallenge && (
              <Challenge />
            )}

            <Bottle />
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => setShowChat(!showChat)}
          className="p-4 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all"
          title="Chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {showChat && <Chat onClose={() => setShowChat(false)} />}
    </div>
  );
}
