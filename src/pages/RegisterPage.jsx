import { useEffect } from 'react';
import App from '../App';

export default function RegisterPage() {
  // Signal to App.jsx that this route is the register screen.
  useEffect(() => {
    localStorage.setItem('authMode', 'register');
  }, []);

  return <App />;
}



