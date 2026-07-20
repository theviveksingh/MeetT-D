import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';

export default function VideoGrid({ participants, roomCode }) {
  const { user } = useAuth();
  const { screenSharing, sendReaction, reactions } = useRoom();
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);
      
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      const { startScreenShare: startShare } = useRoom();
      startShare();
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    
    const { stopScreenShare: stopShare } = useRoom();
    stopShare();
  };

  const myReactions = reactions.filter(r => r.senderId === user._id);

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <div className="relative aspect-video bg-gray-700 rounded-xl overflow-hidden">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName}`}
                alt={user?.displayName}
                className="w-20 h-20 rounded-full"
              />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <span className="px-2 py-1 rounded bg-black/50 text-white text-xs font-medium">
              {user?.displayName} {user?._id === screenSharing && '📺'}
            </span>
            {isMuted && (
              <span className="p-1 rounded bg-red-500/80">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </span>
            )}
          </div>

          {myReactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute top-2 right-2 text-2xl reaction-bubble"
            >
              {reaction.emoji}
            </div>
          ))}
        </div>

        {participants
          .filter(p => p.userId !== user._id)
          .map((participant) => (
            <div
              key={participant.userId}
              className="relative aspect-video bg-gray-700 rounded-xl overflow-hidden"
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={participant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${participant.displayName}`}
                  alt={participant.displayName}
                  className="w-16 h-16 rounded-full"
                />
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <span className="px-2 py-1 rounded bg-black/50 text-white text-xs font-medium">
                  {participant.displayName} {participant.userId === screenSharing && '📺'}
                </span>
              </div>

              {reactions
                .filter(r => r.senderId === participant.userId)
                .map((reaction) => (
                  <div
                    key={reaction.id}
                    className="absolute top-2 right-2 text-2xl reaction-bubble"
                  >
                    {reaction.emoji}
                  </div>
                ))}
            </div>
          ))}
      </div>

      <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-all ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isVideoOff ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {isScreenSharing ? (
          <button
            onClick={stopScreenShare}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all"
            title="Stop sharing"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          </button>
        ) : (
          <button
            onClick={startScreenShare}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-all"
            title="Share screen"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
