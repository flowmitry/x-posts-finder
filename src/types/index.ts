export interface Settings {
  apiUrl: string
  apiKey: string
  modelName: string
  preferences: string
  postLimit: number
}

export interface ProcessingState {
  isProcessing: boolean
  isCompleted: boolean
  processedCount: number
  bookmarkedCount: number
}
