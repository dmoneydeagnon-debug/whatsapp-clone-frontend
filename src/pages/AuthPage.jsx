
import App from '../App';

// Thin wrapper so router paths can map to the existing AuthForm UI inside App.jsx.
// App.jsx already switches between login/register using its internal state.
// We keep this page minimal: App.jsx decides what to render based on token + isLogin.

export default function AuthPage() {
  return <App />;
}

