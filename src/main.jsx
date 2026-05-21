import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css'
import Landing from './landing.jsx'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <GoogleOAuthProvider clientId="663666759545-g5rck4uea28mlbb00fcg8k9d4ku0t9go.apps.googleusercontent.com">
      <Landing />

    </GoogleOAuthProvider>
  </StrictMode>
)