// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Loader2 } from "lucide-react";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleCallback = () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const token = urlParams.get("token");
//       const error = urlParams.get("error");

//       if (error) {
//         console.error("Auth error:", error);
//         navigate(`/?error=${error}`);
//         return;
//       }

//       if (token) {
//         // Token will be stored by apiClient when Dashboard loads
//         navigate("/dashboard");
//       } else {
//         navigate("/?error=no_token");
//       }
//     };

//     handleCallback();
//   }, [navigate]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//       <div className="text-center">
//         <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
//         <p className="text-slate-400">Authenticating...</p>
//       </div>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import apiClient from "../lib/api"; // ADD THIS IMPORT

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔐 AuthCallback: Processing OAuth response");
    console.log("🔐 Full URL:", window.location.href);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    console.log("🔐 Token from URL:", token ? "PRESENT" : "MISSING");
    console.log("🔐 Token length:", token?.length || 0);
    console.log(
      "🔐 Token preview:",
      token ? `${token.substring(0, 30)}...` : "null"
    );

    if (error) {
      console.error("❌ OAuth error:", error);
      navigate(`/?error=${error}`);
      return;
    }

    if (token) {
      // ✅ CRITICAL: STORE THE TOKEN HERE
      console.log("✅ Storing token in localStorage and apiClient");

      // Store in localStorage
      localStorage.setItem("auth_token", token);

      // Also set in apiClient
      apiClient.setToken(token);

      console.log(
        "✅ Token stored. Verifying:",
        localStorage.getItem("auth_token") ? "SUCCESS" : "FAILED"
      );

      // Clear the token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("✅ URL cleaned");

      // Wait a moment to ensure token is stored, then redirect
      setTimeout(() => {
        console.log("🔄 Redirecting to dashboard...");
        navigate("/dashboard");
      }, 100);
    } else {
      console.error("❌ No token in URL");
      console.log(
        "❌ All URL params:",
        Object.fromEntries(urlParams.entries())
      );
      navigate("/?error=no_token");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Completing authentication...</p>
        <p className="text-slate-500 text-sm mt-2">
          Check browser console for details
        </p>
      </div>
    </div>
  );
}
