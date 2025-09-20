import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from '../../lib/constants'
import { addStorageListener, getLocalStorageValue, persistSettings as persistSettingsToChrome } from '../../lib/chrome'
import type { Settings } from '../../types'
import { SettingsContext } from '../contexts/SettingsContext'
import type { SettingsContextValue } from '../contexts/SettingsContext'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const storedSettings = await getLocalStorageValue<Settings>(SETTINGS_STORAGE_KEY)
        if (storedSettings && isMounted) {
          setSettingsState((prev) => ({ ...prev, ...storedSettings }))
        }
      } catch (error) {
        console.error('Failed to load settings from chrome storage:', error)
      } finally {
        if (isMounted) {
          setIsSettingsLoaded(true)
        }
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return addStorageListener((changes, areaName) => {
      if (areaName !== 'local') {
        return
      }

      const change = changes[SETTINGS_STORAGE_KEY]

      if (change?.newValue) {
        setSettingsState((prev) => ({ ...prev, ...change.newValue as Settings }))
      }
    })
  }, [])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setSettings = useCallback((nextSettings: Settings) => {
    setSettingsState(nextSettings)
  }, [])

  const saveSettings = useCallback(async (nextSettings?: Settings) => {
    const payload = nextSettings ?? settings
    try {
      await persistSettingsToChrome(payload)
    } catch (error) {
      console.error('Failed to persist settings to chrome storage:', error)
    }
  }, [settings])

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    isSettingsLoaded,
    updateSettings,
    setSettings,
    saveSettings
  }), [isSettingsLoaded, saveSettings, setSettings, settings, updateSettings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
