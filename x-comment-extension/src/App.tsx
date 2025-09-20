import { useState, useEffect } from 'react'

interface Settings {
  apiUrl: string
  apiKey: string
  modelName: string
  preferences: string
  postLimit: number
}

function App() {
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
    // Load saved settings
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings)
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

  const startProcessing = async () => {
    console.log('🚀 Start button clicked!')
    console.log('📋 Current settings:', settings)
    
    if (!settings.preferences) {
      console.log('❌ No preferences provided')
      alert('Please fill in your post preferences')
      return
    }

    if (!isTwitterPage) {
      console.log('❌ Not on Twitter/X page')
      alert('Please navigate to Twitter/X first')
      return
    }

    console.log('✅ Starting processing...')
    setIsProcessing(true)
    setIsCompleted(false)
    setProcessedCount(0)
    setBookmarkedCount(0)

    // Send message to content script to start processing
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      console.log('📤 Sending message to tab:', tabs[0].id, 'URL:', tabs[0].url)
      
      // Small delay to ensure script is loaded
      setTimeout(() => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          action: 'START_PROCESSING',
          settings
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Error sending message:', chrome.runtime.lastError.message)
            alert('Extension failed to connect to page. Please refresh the Twitter/X page and try again.')
            setIsProcessing(false)
            return
          }
          console.log('📥 Response from content script:', response)
        })
      }, 100)
    })
  }

  const stopProcessing = () => {
    setIsProcessing(false)
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
  }

  // Listen for messages from content script
  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === 'PROCESSING_UPDATE') {
        setProcessedCount(message.processed)
        setBookmarkedCount(message.bookmarked)
      } else if (message.action === 'PROCESSING_COMPLETE') {
        setIsProcessing(false)
        setIsCompleted(true)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)
    return () => chrome.runtime.onMessage.removeListener(messageListener)
  }, [])

  const progressPercentage = settings.postLimit > 0 ? (processedCount / settings.postLimit) * 100 : 0
  const bookmarkRate = processedCount > 0 ? (bookmarkedCount / processedCount) * 100 : 0

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="header-content">
          <div className="header-icon">
            <span>🎯</span>
          </div>
          <div>
            <h1 className="header-title">X Comment Finder</h1>
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

      <div className="app-content">
        {isProcessing ? (
          // Processing View - Show only progress and stop button
          <>
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-title">Processing Progress</span>
                <div className="progress-status">
                  <div className="status-pulse"></div>
                  <span className="status-label">Active</span>
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

            {/* Stop button */}
            <button
              onClick={stopProcessing}
              className="action-button stop"
            >
              <span>⏹️</span>
              Stop Processing
            </button>
          </>
        ) : isCompleted ? (
          // Completion View - Show results and back button
          <>
            <div className="completion-section">
              <div className="completion-header">
                <span className="completion-icon">✅</span>
                <h2 className="completion-title">Analysis Complete!</h2>
              </div>
              
              <div className="results-summary">
                <div className="result-item">
                  <span className="result-label">Total Processed:</span>
                  <span className="result-value">{processedCount} tweets</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Bookmarked:</span>
                  <span className="result-value">{bookmarkedCount} tweets</span>
                </div>
                <div className="result-item">
                  <span className="result-label">Success Rate:</span>
                  <span className="result-value">{bookmarkRate.toFixed(1)}%</span>
                </div>
              </div>
              
              {bookmarkedCount > 0 && (
                <div className="completion-message">
                  <p>🎉 Found {bookmarkedCount} tweets that match your preferences!</p>
                  <p>Check your X bookmarks to see the selected tweets.</p>
                </div>
              )}
              
              {bookmarkedCount === 0 && (
                <div className="completion-message">
                  <p>🔍 No tweets matched your criteria this time.</p>
                  <p>Try adjusting your preferences or checking a different part of your feed.</p>
                </div>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={goBack}
              className="action-button start"
            >
              <span>←</span>
              Back to Settings
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

export default App
