import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PredictPage from "./pages/PredictPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistoryPage from "./pages/HistoryPage";
import RequireAuth from "./auth/RequireAuth";
import RecommendWizardPage from "./pages/RecommendWizardPage";

export default function App() {
  return (
    <div className="ui-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/predict" element={<PredictPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/history"
          element={
            <RequireAuth>
              <HistoryPage />
            </RequireAuth>
          }
        />

        <Route
          path="/recommend"
          element={
            <RequireAuth>
              <RecommendWizardPage />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}