import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "./hooks/useToast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import HowToPlay from "./pages/HowToPlay";
import LevelSelect from "./pages/LevelSelect";
import Game from "./pages/Game";
import Level1 from "./pages/Levels/Level1";
import Level2 from "./pages/Levels/Level2";
import Level3 from "./pages/Levels/Level3";
import Level4 from "./pages/Levels/Level4";
import Level5 from "./pages/Levels/Level5";
import Level6 from "./pages/Levels/Level6";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "var(--accent)",
          fontFamily: "var(--font-head)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="loading-spinner" />
        <span style={{ fontSize: 11, letterSpacing: 2 }}>INITIALIZING...</span>
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/levels"
            element={
              <ProtectedRoute>
                <LevelSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/1"
            element={
              <ProtectedRoute>
                <Level1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/2"
            element={
              <ProtectedRoute>
                <Level2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/3"
            element={
              <ProtectedRoute>
                <Level3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/4"
            element={
              <ProtectedRoute>
                <Level4 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/5"
            element={
              <ProtectedRoute>
                <Level5 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level/6"
            element={
              <ProtectedRoute>
                <Level6 />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
