import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArchitecturePage from "./pages/ArchitecturePage";
import FeaturesPage from "./pages/FeaturesPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
