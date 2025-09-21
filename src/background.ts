// Background script for XPostsFinder extension

import type { ProcessingState, Settings } from './types'

chrome.runtime.onInstalled.addListener(() => {
  console.log('XPostsFinder extension installed')
})

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Handle API calls to avoid CSP restrictions
  if (message.action === 'ANALYZE_TWEET') {
    analyzeTweet(message.tweetText, message.settings)
      .then(result => {
        sendResponse({ success: true, shouldBookmark: result })
      })
      .catch(error => {
        console.error('Error analyzing tweet:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep message channel open for async response
  }
  
  // Icon remains static - no changes during processing
  
  // Forward messages between content script and popup
  if (message.action === 'PROCESSING_UPDATE' || message.action === 'PROCESSING_COMPLETE') {
    // Store the processing state in chrome.storage for persistence
    const processingState: ProcessingState = {
      isProcessing: message.action === 'PROCESSING_UPDATE',
      isCompleted: message.action === 'PROCESSING_COMPLETE',
      processedCount: message.processed || 0,
      bookmarkedCount: message.bookmarked || 0
    }
    
    chrome.storage.local.set({ processingState })
    
    // Broadcast to all extension contexts (popup)
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might be closed, ignore errors
    })
  }
  
  sendResponse({ success: true })
})

async function analyzeTweet(tweetText: string, settings: Settings): Promise<boolean> {
  try {
    const prompt = `I want to bookmark posts about: "${settings.preferences}"

Tweet: "${tweetText}"

Should I bookmark this post? Answer only YES or NO.`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Only add Authorization header if API key is provided
    if (settings.apiKey && settings.apiKey.trim()) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`
    }
    
    const requestBody = {
      model: settings.modelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }

    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} - ${responseText}`)
    }

    let data: ModelResponse
    try {
      data = JSON.parse(responseText) as ModelResponse
    } catch {
      throw new Error(`Invalid JSON response: ${responseText}`)
    }

    const rawContent = data.choices?.[0]?.message?.content?.trim() || ''

    // Use content field as primary decision source
    const contentUpper = rawContent.toUpperCase()

    if (contentUpper.includes('YES')) {
      return true
    }

    if (contentUpper.includes('NO')) {
      return false
    }

    return false
  } catch (error) {
    console.error('Error analyzing tweet:', error)
    return false
  }
}

interface ModelMessage {
  content?: string
}

interface ModelChoice {
  message?: ModelMessage
}

interface ModelResponse {
  choices?: ModelChoice[]
}
