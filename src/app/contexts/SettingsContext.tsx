import { createContext, useContext } from 'react'
import type { Settings } from '../../types'

export interface SettingsContextValue {
  settings: Settings
  isSettingsLoaded: boolean
  updateSettings: (updates: Partial<Settings>) => void
  setSettings: (nextSettings: Settings) => void
  saveSettings: (nextSettings?: Settings) => Promise<void>
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function useSettingsContext() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider')
  }

  return context
}
