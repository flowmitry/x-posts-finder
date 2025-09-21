import type { ProcessingState, Settings } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  modelName: 'gpt-5-nano',
  preferences: 'Only include posts from solo builders when they share real, specific work on their product.',
  postLimit: 100
}

export const INITIAL_PROCESSING_STATE: ProcessingState = {
  isProcessing: false,
  isCompleted: false,
  processedCount: 0,
  bookmarkedCount: 0
}

export const SETTINGS_STORAGE_KEY = 'settings'
export const PROCESSING_STORAGE_KEY = 'processingState'

export const TWITTER_DOMAINS = ['twitter.com', 'x.com']
