import { useState, useEffect } from 'react'

interface Settings {
  apiUrl: string
  apiKey: string
  modelName: string
  preferences: string
  postLimit: number
}

function XPostsFinder() {
  const [settings, setSettings] = useState<Settings>({
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    modelName: 'gpt-3.5-turbo',
    preferences: '',
    postLimit: 1000
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isTwitterPage, setIsTwitterPage] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const [bookmarkedCount, setBookmarkedCount] = useState(0)

  useEffect(() => {
    // Load saved settings and processing state
    chrome.storage.local.get(['settings', 'processingState'], (result) => {
      if (result.settings) {
        setSettings(result.settings)
      }
      
      // Restore processing state if it exists
      if (result.processingState) {
        const { isProcessing, isCompleted, processedCount, bookmarkedCount } = result.processingState
        setIsProcessing(isProcessing || false)
        setIsCompleted(isCompleted || false)
        setProcessedCount(processedCount || 0)
        setBookmarkedCount(bookmarkedCount || 0)
      }
    })

    // Check if current tab is Twitter/X
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || ''
      setIsTwitterPage(url.includes('twitter.com') || url.includes('x.com'))
    })
  }, [])

  const saveSettings = () => {
    chrome.storage.local.set({ settings })
  }

  const saveProcessingState = (state: {
    isProcessing: boolean
    isCompleted: boolean
    processedCount: number
    bookmarkedCount: number
  }) => {
    chrome.storage.local.set({ processingState: state })
  }

  const startProcessing = async () => {
    if (!settings.preferences) {
      alert('Please fill in your post preferences')
      return
    }

    if (!isTwitterPage) {
      alert('Please navigate to Twitter/X first')
      return
    }
    setIsProcessing(true)
    setIsCompleted(false)
    setProcessedCount(0)
    setBookmarkedCount(0)
    
    // Save processing state
    saveProcessingState({
      isProcessing: true,
      isCompleted: false,
      processedCount: 0,
      bookmarkedCount: 0
    })

    // Send message to content script to start processing
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      // Small delay to ensure script is loaded
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          action: 'START_PROCESSING',
          settings
        }, (_response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message)
            alert('Extension failed to connect to page. Please refresh the Twitter/X page and try again.')
            setIsProcessing(false)
            return
          }
        })
      }, 100)
    })
  }

  const stopProcessing = () => {
    setIsProcessing(false)
    setIsCompleted(true)
    saveProcessingState({
      isProcessing: false,
      isCompleted: true,
      processedCount: processedCount,
      bookmarkedCount: bookmarkedCount
    })
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: 'STOP_PROCESSING'
      })
    })
  }

  const goBack = () => {
    setIsCompleted(false)
    setProcessedCount(0)
    setBookmarkedCount(0)
    
    // Clear processing state
    saveProcessingState({
      isProcessing: false,
      isCompleted: false,
      processedCount: 0,
      bookmarkedCount: 0
    })
  }

  // Listen for messages from content script
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'PROCESSING_UPDATE') {
        setProcessedCount(message.processed)
        setBookmarkedCount(message.bookmarked)
        
        // Save updated counts
        saveProcessingState({
          isProcessing: true,
          isCompleted: false,
          processedCount: message.processed,
          bookmarkedCount: message.bookmarked
        })
      } else if (message.action === 'PROCESSING_COMPLETE') {
        setIsProcessing(false)
        setIsCompleted(true)
        
        // Save completion state with final counts from message
        saveProcessingState({
          isProcessing: false,
          isCompleted: true,
          processedCount: message.processed || processedCount,
          bookmarkedCount: message.bookmarked || bookmarkedCount
        })
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)
    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  // Listen for storage changes (updates from background script)
  useEffect(() => {
    const storageListener = (changes: any) => {
      if (changes.processingState && changes.processingState.newValue) {
        const state = changes.processingState.newValue
        
        setIsProcessing(state.isProcessing || false)
        setIsCompleted(state.isCompleted || false)
        setProcessedCount(state.processedCount || 0)
        setBookmarkedCount(state.bookmarkedCount || 0)
      }
    }

    chrome.storage.onChanged.addListener(storageListener)
    return () => chrome.storage.onChanged.removeListener(storageListener)
  }, [])

  const progressPercentage = settings.postLimit > 0 ? (processedCount / settings.postLimit) * 100 : 0
  const bookmarkRate = processedCount > 0 ? (bookmarkedCount / processedCount) * 100 : 0

  return (
    <div className="x-posts-finder-container">
      {/* Header */}
      <div className="x-posts-finder-header">
        <div className="header-content">
          <div className={`header-icon ${isProcessing ? 'processing' : ''}`}>
            <span>X?</span>
          </div>
          <div>
            <h1 className="header-title">X posts finder</h1>
            <p className="header-subtitle">AI-powered tweet discovery</p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="status-indicator">
          <div className={`status-dot ${isTwitterPage ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">
            {isTwitterPage ? 'Connected to X' : 'Not on X/Twitter'}
          </span>
        </div>
      </div>

      <div className="x-posts-finder-content">
        {isProcessing || isCompleted ? (
          // Processing/Completed View - Show progress and stop/back button
          <>
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-title">
                  {isCompleted ? 'Analysis Complete!' : 'Processing Progress'}
                </span>
                <div className="progress-status">
                  {isCompleted ? (
                    <span className="status-label">✅ Done</span>
                  ) : (
                    <>
                      <div className="status-pulse"></div>
                      <span className="status-label">Active</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card processed">
                  <div className="stat-value processed">{processedCount}</div>
                  <div className="stat-label">Processed</div>
                </div>
                <div className="stat-card bookmarked">
                  <div className="stat-value bookmarked">{bookmarkedCount}</div>
                  <div className="stat-label">Bookmarked</div>
                </div>
                <div className="stat-card rate">
                  <div className="stat-value rate">{bookmarkRate.toFixed(0)}%</div>
                  <div className="stat-label">Hit Rate</div>
                </div>
              </div>
            </div>

            {/* Stop/Back button */}
            <button
              onClick={isCompleted ? goBack : stopProcessing}
              className={`action-button ${isCompleted ? 'start' : 'stop'}`}
            >
              {isCompleted ? (
                <>
                  <span>←</span>
                  Back
                </>
              ) : (
                <>
                  <span>⏹️</span>
                  Stop Processing
                </>
              )}
            </button>
          </>
        ) : (
          // Configuration View - Show settings and start button
          <>
            {/* Error message */}
            {!isTwitterPage && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <p className="error-text">Please navigate to Twitter/X first</p>
              </div>
            )}

            {/* Configuration */}
            <div className="config-section">
              <h2 className="section-title">
                <span>⚙️</span> Configuration
              </h2>
              
              <div className="form-group form-group-compact">
                <label className="form-label">API Endpoint</label>
                <input
                  type="text"
                  value={settings.apiUrl}
                  onChange={(e) => setSettings({...settings, apiUrl: e.target.value})}
                  onBlur={saveSettings}
                  className="form-input form-input-compact"
                  placeholder="API endpoint URL"
                />
              </div>

              <div className="form-group form-group-compact">
                <label className="form-label">API Key (Optional)</label>
                <div className="input-with-icon">
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
                    onBlur={saveSettings}
                    className="form-input form-input-compact"
                    placeholder="API key (optional)"
                  />
                  <div className={`input-icon input-icon-compact ${settings.apiKey ? 'valid' : 'invalid'}`}>
                    {settings.apiKey ? '🔑' : '🔒'}
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group form-group-compact">
                  <label className="form-label">Model Name</label>
                  <input
                    type="text"
                    value={settings.modelName}
                    onChange={(e) => setSettings({...settings, modelName: e.target.value})}
                    onBlur={saveSettings}
                    className="form-input form-input-compact"
                    placeholder="Model name"
                  />
                </div>
                
                <div className="form-group form-group-compact">
                  <label className="form-label">Post Limit</label>
                  <input
                    type="number"
                    value={settings.postLimit}
                    onChange={(e) => setSettings({...settings, postLimit: parseInt(e.target.value)})}
                    onBlur={saveSettings}
                    className="form-input form-input-compact"
                    min="1"
                    max="10000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Post Preferences</label>
                <textarea
                  value={settings.preferences}
                  onChange={(e) => setSettings({...settings, preferences: e.target.value})}
                  onBlur={saveSettings}
                  className="form-textarea"
                  placeholder="I want to comment on posts about technology, startups, or programming that seem controversial or have interesting discussions..."
                />
                <div className="character-counter">
                  {settings.preferences.length}/500 characters
                </div>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={startProcessing}
              disabled={!isTwitterPage}
              className={`action-button ${isTwitterPage ? 'start' : ''}`}
            >
              <span>🚀</span>
              {isTwitterPage ? 'Start Analysis' : 'Go to X/Twitter First'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default XPostsFinder
