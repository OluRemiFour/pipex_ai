import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const error = urlParams.get("error");

      if (error) {
        console.error("Auth error:", error);
        navigate(`/?error=${error}`);
        return;
      }

      if (token) {
        localStorage.setItem("auth_token", token);
        // Token will be stored by apiClient when Dashboard loads
        navigate("/dashboard");
      } else {
        navigate("/?error=no_token");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Authenticating...</p>
      </div>
    </div>
  );
}
