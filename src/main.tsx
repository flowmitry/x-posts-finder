import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import XPostsFinder from './XPostsFinder.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <XPostsFinder />
  </StrictMode>,
)
