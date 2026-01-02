// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import HomePage from "./pages/HomePage";
// import ArchitecturePage from "./pages/ArchitecturePage";
// import FeaturesPage from "./pages/FeaturesPage";
// import DashboardPage from "./pages/DashboardPage";
// import "./App.css";

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<HomePage />} />
//           <Route path="/architecture" element={<ArchitecturePage />} />
//           <Route path="/features" element={<FeaturesPage />} />
//           <Route path="/dashboard" element={<DashboardPage />} />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ArchitecturePage from "./pages/ArchitecturePage";
import FeaturesPage from "./pages/FeaturesPage";
import DashboardPage from "./pages/DashboardPage";
import AuthCallback from "./pages/AuthCallback"; // Keep this for OAuth callback
import "./App.css";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/features" element={<FeaturesPage />} />

          {/* Dashboard Route */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
