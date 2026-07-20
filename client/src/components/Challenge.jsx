import { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';

const REACTIONS = ['😂', '🔥', '❤️', '💀', '👏', '✨', '🤪'];

export default function Challenge() {
  const { user } = useAuth();
  const { gameState, timerDuration, skipVote, extendTime, selectedPlayer, isHost, isCohost, sendReaction } = useRoom();
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [hasVotedSkip, setHasVotedSkip] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(timerDuration);
  }, [timerDuration]);

  useEffect(() => {
    if (!gameState.currentChallenge) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.currentChallenge]);

  const handleSkipVote = () => {
    if (!hasVotedSkip) {
      skipVote();
      setHasVotedSkip(true);
    }
  };

  const handleExtendTime = () => {
    extendTime(15);
    setTimeLeft((prev) => prev + 15);
  };

  const handleReaction = (emoji) => {
    sendReaction(emoji);
  };

  const challenge = gameState.currentChallenge;
  const isMyTurn = selectedPlayer?.userId === user._id;
  const canControl = isHost || isCohost;
  const timerPercentage = (timeLeft / timerDuration) * 100;

  if (!challenge) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-2xl border border-purple-500/30 overflow-hidden">
      <div className="relative p-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-700">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            challenge.type === 'truth'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-pink-500/20 text-pink-400'
          }`}>
            {challenge.type?.toUpperCase()}
          </span>
          <span className="text-white font-mono text-xl">{timeLeft}s</span>
        </div>

        <p className="text-white text-xl font-medium text-center mb-6 leading-relaxed">
          {challenge.text}
        </p>

        {challenge.category && (
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              challenge.category === 'funny' ? 'bg-yellow-500/20 text-yellow-400' :
              challenge.category === 'bold' ? 'bg-orange-500/20 text-orange-400' :
              challenge.category === 'personal' ? 'bg-purple-500/20 text-purple-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {challenge.category.toUpperCase()}
            </span>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleSkipVote}
            disabled={hasVotedSkip}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
              hasVotedSkip
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {hasVotedSkip ? 'Skip Vote Submitted' : 'Vote to Skip'}
          </button>

          {canControl && (
            <button
              onClick={handleExtendTime}
              className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-all"
            >
              +15 seconds
            </button>
          )}
        </div>

        {isMyTurn && timeLeft === 0 && (
          <div className="mt-4 p-3 bg-green-500/20 rounded-lg text-center">
            <p className="text-green-400 font-medium">
              Time's up! Great job! 🎉
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 text-lg transition-all hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
