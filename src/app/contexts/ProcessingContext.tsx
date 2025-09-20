import { createContext, useContext } from 'react'
import type { ProcessingState } from '../../types'

export interface ProcessingContextValue {
  state: ProcessingState
  isProcessingLoaded: boolean
  isProcessing: boolean
  isCompleted: boolean
  processedCount: number
  bookmarkedCount: number
  isTwitterPage: boolean
  refreshTwitterStatus: () => Promise<boolean>
  startProcessing: () => Promise<void>
  stopProcessing: () => Promise<void>
  resetProcessing: () => void
  updateProcessingState: (updates: Partial<ProcessingState>, options?: { persist?: boolean }) => void
}

export const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined)

export function useProcessingContext() {
  const context = useContext(ProcessingContext)

  if (!context) {
    throw new Error('useProcessingContext must be used within ProcessingProvider')
  }

  return context
}
