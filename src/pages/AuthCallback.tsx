import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Google OAuth callback
    const accessToken = searchParams.get('access_token');
    
    if (accessToken) {
      // Fetch user info from Google
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          // Send message to parent window
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              email: data.email,
              name: data.name,
              googleId: data.id,
            }, window.location.origin);
            window.close();
          } else {
            navigate('/');
          }
        })
        .catch(() => {
          navigate('/login?error=google_auth_failed');
        });
    } else {
      navigate('/login?error=google_auth_cancelled');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mamacare-cream">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-mamacare-coral mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
