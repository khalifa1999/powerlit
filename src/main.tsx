import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeAuth } from './stores/authStore.ts'

// AuthInitializer component
function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuth();
  }, []);
  
  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthInitializer>
      <App />
    </AuthInitializer>
  </StrictMode>,
)
