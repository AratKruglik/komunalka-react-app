import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from '@shared/components/theme/ThemeProvider'
import { AuthProvider, AddressProvider, AddressSyncProvider } from '@shared/contexts'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AddressProvider>
        <AddressSyncProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AddressSyncProvider>
      </AddressProvider>
    </AuthProvider>
  </StrictMode>,
)
