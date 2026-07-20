import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Challenges from './pages/Challenges';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/room/:roomCode"
              element={
                <PrivateRoute>
                  <Room />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <PrivateRoute>
                  <Challenges />
                </PrivateRoute>
              }
            />
          </Routes>
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
