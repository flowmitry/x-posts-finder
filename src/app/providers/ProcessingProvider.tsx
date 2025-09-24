import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveTwitterTab } from '../../hooks/useActiveTwitterTab'
import { INITIAL_PROCESSING_STATE, PROCESSING_STORAGE_KEY } from '../../lib/constants'
import {
  addRuntimeMessageListener,
  addStorageListener,
  getActiveTab,
  getLocalStorageValue,
  persistProcessingState,
  sendMessageToTab
} from '../../lib/chrome'
import type { ProcessingState } from '../../types'
import { ProcessingContext } from '../contexts/ProcessingContext'
import type { ProcessingContextValue } from '../contexts/ProcessingContext'
import { useSettingsContext } from '../contexts/SettingsContext'

function mergeProcessingState(current: ProcessingState, updates: Partial<ProcessingState>): ProcessingState {
  return { ...current, ...updates }
}

export function ProcessingProvider({ children }: { children: React.ReactNode }) {
  const { settings, saveSettings } = useSettingsContext()
  const { isTwitterPage, refreshStatus } = useActiveTwitterTab()

  const [state, setState] = useState<ProcessingState>(INITIAL_PROCESSING_STATE)
  const [isProcessingLoaded, setIsProcessingLoaded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProcessingState = async () => {
      try {
        const storedState = await getLocalStorageValue<ProcessingState>(PROCESSING_STORAGE_KEY)
        if (storedState && isMounted) {
          setState((prev) => mergeProcessingState(prev, storedState))
        }
      } catch (error) {
        console.error('Failed to load processing state from chrome storage:', error)
      } finally {
        if (isMounted) {
          setIsProcessingLoaded(true)
        }
      }
    }

    void loadProcessingState()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return addRuntimeMessageListener((message) => {
      if (!message || typeof message !== 'object') {
        return
      }

      if (message.action === 'PROCESSING_UPDATE') {
        setState((prev) => mergeProcessingState(prev, {
          isProcessing: true,
          isCompleted: false,
          processedCount: message.processed ?? prev.processedCount,
          bookmarkedCount: message.bookmarked ?? prev.bookmarkedCount
        }))
      }

      if (message.action === 'PROCESSING_COMPLETE') {
        setState((prev) => mergeProcessingState(prev, {
          isProcessing: false,
          isCompleted: true,
          processedCount: message.processed ?? prev.processedCount,
          bookmarkedCount: message.bookmarked ?? prev.bookmarkedCount
        }))
      }
    })
  }, [])

  useEffect(() => {
    return addStorageListener((changes, areaName) => {
      if (areaName !== 'local') {
        return
      }

      const change = changes[PROCESSING_STORAGE_KEY]
      if (change?.newValue) {
        setState((prev) => mergeProcessingState(prev, change.newValue as ProcessingState))
      }
    })
  }, [])

  const updateProcessingState = useCallback((updates: Partial<ProcessingState>, options: { persist?: boolean } = {}) => {
    setState((prev) => {
      const nextState = mergeProcessingState(prev, updates)
      if (options.persist) {
        void persistProcessingState(nextState)
      }
      return nextState
    })
  }, [])

  const startProcessing = useCallback(async () => {
    if (!settings.preferences.trim()) {
      alert('Please fill in your post preferences')
      return
    }

    const onTwitter = await refreshStatus()
    if (!onTwitter) {
      alert('Please navigate to Twitter/X first')
      return
    }

    try {
      await saveSettings()
    } catch (error) {
      console.error('Failed to persist settings before processing:', error)
    }

    updateProcessingState({
      isProcessing: true,
      isCompleted: false,
      processedCount: 0,
      bookmarkedCount: 0
    }, { persist: true })

    const tab = await getActiveTab()
    if (!tab?.id) {
      alert('Extension could not locate the active tab. Please try again.')
      updateProcessingState({ isProcessing: false }, { persist: true })
      return
    }

    const tabId = tab.id

    setTimeout(() => {
      void sendMessageToTab(tabId, {
        action: 'START_PROCESSING',
        settings
      }).catch((error) => {
        console.error('Error sending START_PROCESSING message:', error)
        alert('Extension failed to connect to page. Please refresh the Twitter/X page and try again.')
        updateProcessingState({ isProcessing: false, isCompleted: false }, { persist: true })
      })
    }, 100)
  }, [refreshStatus, saveSettings, settings, updateProcessingState])

  const stopProcessing = useCallback(async () => {
    const tab = await getActiveTab()
    if (tab?.id) {
      try {
        await sendMessageToTab(tab.id, { action: 'STOP_PROCESSING' })
      } catch (error) {
        console.error('Failed to send STOP_PROCESSING message:', error)
      }
    }

    updateProcessingState({
      isProcessing: false,
      isCompleted: true
    }, { persist: true })
  }, [updateProcessingState])

  const continueProcessing = useCallback(async () => {
    const onTwitter = await refreshStatus()
    if (!onTwitter) {
      alert('Please navigate to Twitter/X first')
      return
    }

    const tab = await getActiveTab()
    if (!tab?.id) {
      alert('Extension could not locate the active tab. Please try again.')
      return
    }

    updateProcessingState({
      isProcessing: true,
      isCompleted: false
    }, { persist: true })

    try {
      await sendMessageToTab(tab.id, {
        action: 'CONTINUE_PROCESSING',
        settings
      })
    } catch (error) {
      console.error('Error sending CONTINUE_PROCESSING message:', error)
      alert('Extension failed to continue. Please refresh the Twitter/X page and try again.')
      updateProcessingState({ isProcessing: false }, { persist: true })
    }
  }, [refreshStatus, settings, updateProcessingState])

  const startFromCurrentPosition = useCallback(async () => {
    const onTwitter = await refreshStatus()
    if (!onTwitter) {
      alert('Please navigate to Twitter/X first')
      return
    }

    try {
      await saveSettings()
    } catch (error) {
      console.error('Failed to persist settings before restarting:', error)
    }

    const tab = await getActiveTab()
    if (!tab?.id) {
      alert('Extension could not locate the active tab. Please try again.')
      return
    }

    updateProcessingState({
      isProcessing: true,
      isCompleted: false,
      processedCount: 0,
      bookmarkedCount: 0
    }, { persist: true })

    try {
      await sendMessageToTab(tab.id, {
        action: 'RESTART_PROCESSING_FROM_CURRENT',
        settings
      })
    } catch (error) {
      console.error('Error sending RESTART_PROCESSING_FROM_CURRENT message:', error)
      alert('Extension failed to restart. Please refresh the Twitter/X page and try again.')
      updateProcessingState({ isProcessing: false }, { persist: true })
    }
  }, [refreshStatus, saveSettings, settings, updateProcessingState])

  const resetProcessing = useCallback(() => {
    updateProcessingState({
      ...INITIAL_PROCESSING_STATE
    }, { persist: true })
  }, [updateProcessingState])

  const value = useMemo<ProcessingContextValue>(() => ({
    state,
    isProcessingLoaded,
    isProcessing: state.isProcessing,
    isCompleted: state.isCompleted,
    processedCount: state.processedCount,
    bookmarkedCount: state.bookmarkedCount,
    isTwitterPage,
    refreshTwitterStatus: refreshStatus,
    startProcessing,
    stopProcessing,
    continueProcessing,
    startFromCurrentPosition,
    resetProcessing,
    updateProcessingState
  }), [continueProcessing, isProcessingLoaded, isTwitterPage, refreshStatus, resetProcessing, startFromCurrentPosition, startProcessing, state, stopProcessing, updateProcessingState])

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  )
}
