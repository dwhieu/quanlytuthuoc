import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the id_token from URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1) // remove the # character
        );
        const idToken = hashParams.get('id_token');

        if (!idToken) {
          throw new Error('No ID token found in URL');
        }

        // Send the ID token to your backend
        const response = await fetch('http://localhost:8000/api/auth/oauth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        const text = await response.text();
        if (!response.ok) {
          console.error('Backend error:', text);
          throw new Error(`Failed to validate token with backend: ${text}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error('Failed to parse response as JSON:', text);
          throw new Error('Invalid response format from backend');
        }
        
        // Store the JWT token from backend
        if (data.token) {
          localStorage.setItem('token', data.token);
        } else {
          console.error('No token in response:', data);
          throw new Error('No token received from backend');
        }
        
        // Redirect to dashboard or home page
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Redirect to login page with error
        navigate('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="oauth-callback">
      <p>Processing authentication...</p>
    </div>
  );
};

export default OAuthCallback;