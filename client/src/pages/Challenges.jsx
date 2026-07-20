import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const CATEGORIES = [
  { id: 'funny', label: 'Funny', emoji: '😄', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'bold', label: 'Bold', emoji: '🔥', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'personal', label: 'Personal', emoji: '💭', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'silly', label: 'Silly', emoji: '🤪', color: 'bg-green-500/20 text-green-400' }
];

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    type: 'truth',
    category: 'funny'
  });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { challenges: data } = await api.getCustomChallenges();
      setChallenges(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.createCustomChallenge(formData.text, formData.type, formData.category);
      setShowForm(false);
      setFormData({ text: '', type: 'truth', category: 'funny' });
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      await api.deleteCustomChallenge(challengeId);
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (challenge) => {
    try {
      await api.updateCustomChallenge(challenge._id, { isActive: !challenge.isActive });
      loadChallenges();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.isActive;
    if (filter === 'truth') return c.type === 'truth';
    if (filter === 'dare') return c.type === 'dare';
    return true;
  });

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
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Challenges</h1>
            <p className="text-gray-400">Create and manage your custom Truth or Dare challenges</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {showForm ? 'Cancel' : '+ Add Challenge'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Challenge</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Challenge Text
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter your challenge..."
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'truth' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        formData.type === 'truth'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      Truth
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'dare' })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        formData.type === 'dare'
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      Dare
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Create Challenge
              </button>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'truth', label: 'Truth' },
            { id: 'dare', label: 'Dare' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No challenges found. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge._id}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 border transition-all ${
                  challenge.isActive
                    ? 'border-white/10'
                    : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        challenge.type === 'truth'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-pink-500/20 text-pink-400'
                      }`}>
                        {challenge.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        CATEGORIES.find(c => c.id === challenge.category)?.color || 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {CATEGORIES.find(c => c.id === challenge.category)?.emoji}{' '}
                        {challenge.category}
                      </span>
                      {!challenge.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-white">{challenge.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(challenge)}
                      className={`p-2 rounded-lg transition-all ${
                        challenge.isActive
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                      title={challenge.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {challenge.isActive ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(challenge._id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
