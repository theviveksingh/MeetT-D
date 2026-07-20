import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';

export default function Participants() {
  const { user } = useAuth();
  const { room, participants, isHost, isCohost, assignCohost, kickParticipant } = useRoom();
  const [showCohostMenu, setShowCohostMenu] = useState(null);

  const handleAssignCohost = (userId) => {
    assignCohost(userId);
    setShowCohostMenu(null);
  };

  const handleKick = (userId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      kickParticipant(userId);
    }
  };

  const canAssignCohost = isHost && room?.cohostId === null;
  const canKick = isHost || isCohost;

  return (
    <div className="space-y-2">
      {participants.map((participant) => {
        const isMe = participant.userId === user._id;
        const isParticipantHost = room?.hostId === participant.userId;
        const isParticipantCohost = room?.cohostId === participant.userId;
        const canManage = canKick && !isMe && !isParticipantHost;

        return (
          <div
            key={participant.userId}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div className="relative">
              <img
                src={participant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${participant.displayName}`}
                alt={participant.displayName}
                className="w-10 h-10 rounded-full"
              />
              {isMe && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {participant.displayName}
                {isMe && <span className="text-gray-400 ml-1">(You)</span>}
              </p>
              <div className="flex items-center gap-1">
                {isParticipantHost && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    Host
                  </span>
                )}
                {isParticipantCohost && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    Co-Host
                  </span>
                )}
              </div>
            </div>

            {canManage && (
              <div className="relative">
                <button
                  onClick={() => setShowCohostMenu(showCohostMenu === participant.userId ? null : participant.userId)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showCohostMenu === participant.userId && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 rounded-xl border border-white/10 shadow-lg overflow-hidden z-10">
                    {canAssignCohost && !isParticipantCohost && (
                      <button
                        onClick={() => handleAssignCohost(participant.userId)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all"
                      >
                        Assign Co-Host
                      </button>
                    )}
                    <button
                      onClick={() => handleKick(participant.userId)}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
