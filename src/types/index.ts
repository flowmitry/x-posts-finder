export interface Settings {
  apiUrl: string
  apiKey: string
  modelName: string
  preferences: string
  bookmarksLimit: number
}

export interface ProcessingState {
  isProcessing: boolean
  isCompleted: boolean
  processedCount: number
  bookmarkedCount: number
}
