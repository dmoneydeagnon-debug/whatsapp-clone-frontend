import { GoogleLogin } from '@react-oauth/google';

const AuthForm = ({
  isLogin,
  setIsLogin,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleAuth,
  loading,
  onGoogleLoginSuccess
}) => {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e2937', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '36px', color: 'white' }}>FunChat</h1>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>Simple & Clean</p>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '8px', background: '#334155', color: 'white' }}
              required
            />
          )}

          <input
            type="text"
            placeholder="Email or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '8px', background: '#334155', color: 'white' }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', background: '#334155', color: 'white' }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '17px', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#10b981', cursor: 'pointer' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>

        <GoogleLogin
          onSuccess={onGoogleLoginSuccess}
          onError={() => console.log('Google Login Failed')}
        />
      </div>
    </div>
  );
};

export default AuthForm;
