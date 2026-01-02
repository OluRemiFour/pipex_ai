// In AuthCallback.tsx - Updated version
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import apiClient from "../lib/api";

// In AuthCallback.tsx - SIMPLIFIED
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔐 AuthCallback executing");

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      console.error("❌ No token in URL");
      navigate("/");
      return;
    }

    console.log("✅ Token received, storing...");

    // Store token
    localStorage.setItem("auth_token", token);

    // Clear URL
    window.history.replaceState({}, document.title, window.location.pathname);

    console.log("🔄 Redirecting to dashboard");

    // Redirect immediately without verification
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
    </div>
  );
}

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleCallback = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const token = urlParams.get("token");
//       const error = urlParams.get("error");

//       if (error) {
//         console.error("Auth error:", error);
//         navigate(`/?error=${error}`);
//         return;
//       }

//       if (token) {
//         // Store the token using apiClient
//         apiClient.setToken(token);

//         // Verify the token works before redirecting
//         try {
//           const { user } = await apiClient.getCurrentUser();
//           console.log("User authenticated:", user.email);

//           // Clear the URL after storing token
//           window.history.replaceState(
//             {},
//             document.title,
//             window.location.pathname
//           );

//           // Redirect to dashboard
//           navigate("/dashboard");
//         } catch (authError) {
//           console.error("Token verification failed:", authError);
//           localStorage.removeItem("auth_token");
//           navigate("/login?error=token_invalid");
//         }
//       } else {
//         navigate("/login?error=no_token");
//       }
//     };

//     handleCallback();
//   }, [navigate]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//       <div className="text-center">
//         <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
//         <p className="text-slate-400">Completing authentication...</p>
//       </div>
//     </div>
//   );
// }
