// AuthCallback.tsx - DEBUG VERSION
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔐 AuthCallback component MOUNTED");
    console.log("🔐 Full URL:", window.location.href);
    console.log("🔐 Search params:", window.location.search);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const code = urlParams.get("code");

    console.log("🔐 Parsed params:", { token, error, code });
    console.log("🔐 All URL params:", Object.fromEntries(urlParams.entries()));

    if (error) {
      console.error("❌ OAuth error:", error);
      navigate(`/?error=${error}`);
      return;
    }

    if (token) {
      console.log("✅ Token found, length:", token.length);
      console.log("✅ Token preview:", token.substring(0, 50) + "...");

      // Store token
      localStorage.setItem("auth_token", token);
      console.log("✅ Token stored in localStorage");
      console.log("✅ Verify storage:", localStorage.getItem("auth_token"));

      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("✅ URL cleared");

      // Wait a moment then redirect
      setTimeout(() => {
        console.log("🔄 Redirecting to dashboard...");
        navigate("/dashboard");
      }, 100);
    } else if (code) {
      console.log("⚠️ Got auth code instead of token");
      console.log("This means backend callback is not working properly");
      navigate("/?error=no_token_but_code");
    } else {
      console.error("❌ No token or code in URL");
      navigate("/?error=no_auth_data");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Processing authentication...</p>
        <p className="text-slate-500 text-sm mt-2">Check console for details</p>
      </div>
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
