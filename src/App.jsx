import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import "../../styles/mobile.css";

import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Ideas from "./pages/Ideas";
import Research from "./pages/Research";
import Coding from "./pages/Coding";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Help from "./pages/Help";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC AUTH ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* PROTECTED APPLICATION */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/ideas"
            element={<Ideas />}
          />

          <Route
            path="/research"
            element={<Research />}
          />

          <Route
            path="/coding"
            element={<Coding />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/help"
            element={<Help />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}