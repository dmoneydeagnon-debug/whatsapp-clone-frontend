import { useEffect } from 'react';
import App from '../App';

export default function LoginPage() {
  // Signal to App.jsx that this route is the login screen.
  useEffect(() => {
    localStorage.setItem('authMode', 'login');
  }, []);

  return <App />;
}



