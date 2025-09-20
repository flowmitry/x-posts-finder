// Background script for X Comment Finder extension

interface Settings {
  apiUrl: string
  apiKey: string
  modelName: string
  preferences: string
  postLimit: number
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('X Comment Finder extension installed')
  
  // Log a sample request structure for debugging
  const sampleRequest = {
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: "Sample prompt for testing"
      }
    ],
    max_tokens: 10,
    temperature: 0
  }
  console.log('📋 Sample request structure:', JSON.stringify(sampleRequest, null, 2))
})

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('📨 Background received message:', message.action)
  
  // Handle API calls to avoid CSP restrictions
  if (message.action === 'ANALYZE_TWEET') {
    console.log('🔍 Starting tweet analysis in background...')
    console.log('📝 Tweet text:', message.tweetText?.substring(0, 100) + '...')
    console.log('⚙️ Settings received:', {
      apiUrl: message.settings?.apiUrl,
      modelName: message.settings?.modelName,
      hasApiKey: !!message.settings?.apiKey,
      preferences: message.settings?.preferences?.substring(0, 50) + '...'
    })
    
    analyzeTweet(message.tweetText, message.settings)
      .then(result => {
        console.log('✅ Analysis complete, sending result:', result)
        sendResponse({ success: true, shouldBookmark: result })
      })
      .catch(error => {
        console.error('❌ Error analyzing tweet in background:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep message channel open for async response
  }
  
  // Forward messages between content script and popup
  if (message.action === 'PROCESSING_UPDATE' || message.action === 'PROCESSING_COMPLETE') {
    // Broadcast to all extension contexts (popup)
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might be closed, ignore errors
    })
  }
  
  sendResponse({ success: true })
})

async function analyzeTweet(tweetText: string, settings: Settings): Promise<boolean> {
  try {
    console.log('🔍 Analyzing tweet in background:', tweetText.substring(0, 100) + '...')
    console.log('⚙️ Settings:', {
      apiUrl: settings.apiUrl,
      modelName: settings.modelName,
      hasApiKey: !!settings.apiKey,
      preferences: settings.preferences.substring(0, 50) + '...'
    })
    
    const prompt = `I want to comment on tweets about: "${settings.preferences}"

Tweet: "${tweetText}"

Should I comment? Answer only YES or NO.`
    
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
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 50,
      temperature: 0
    }
    
    // Validate the request structure
    console.log('🔍 Request validation:')
    console.log('  - model:', typeof requestBody.model, requestBody.model)
    console.log('  - messages type:', typeof requestBody.messages)
    console.log('  - messages length:', requestBody.messages.length)
    console.log('  - first message:', requestBody.messages[0])
    console.log('  - message role:', typeof requestBody.messages[0].role, requestBody.messages[0].role)
    console.log('  - message content type:', typeof requestBody.messages[0].content)
    console.log('  - message content length:', requestBody.messages[0].content.length)
    
    console.log('📤 Making API request to:', settings.apiUrl)
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2))
    console.log('🔍 Messages array:', requestBody.messages)
    
    const requestBodyString = JSON.stringify(requestBody)
    
    console.log('🔗 Request headers:', headers)
    console.log('📄 Request body string length:', requestBodyString.length)
    console.log('📄 Full request body string:', requestBodyString)
    
    // Log the actual fetch parameters
    const fetchOptions = {
      method: 'POST',
      headers,
      body: requestBodyString
    }
    console.log('🌐 Full fetch options:', fetchOptions)
    
    const response = await fetch(settings.apiUrl, fetchOptions)
    
    console.log('📥 Response status:', response.status)
    console.log('📥 Response statusText:', response.statusText)
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Always get response text first to preserve it
    const responseText = await response.text()
    console.log('📄 Raw response text:', responseText)
    
    if (!response.ok) {
      console.error('❌ API request failed!')
      console.error('❌ Status:', response.status, response.statusText)
      console.error('❌ Response text:', responseText)
      console.error('❌ Request URL:', settings.apiUrl)
      console.error('❌ Request headers:', headers)
      console.error('❌ Request body:', requestBodyString)
      throw new Error(`API request failed: ${response.status} - ${responseText}`)
    }
    
    // Parse the response
    let data
    try {
      data = JSON.parse(responseText)
      console.log('📊 Parsed response data:', data)
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError)
      console.error('❌ Raw response was:', responseText)
      throw new Error(`Invalid JSON response: ${responseText}`)
    }
    
    const rawContent = data.choices?.[0]?.message?.content?.trim() || ""
    const reasoning = data.choices?.[0]?.message?.reasoning?.trim() || ""
    
    console.log('🎯 Raw AI content:', rawContent)
    console.log('🎯 AI reasoning:', reasoning)
    
    // Use content field as primary decision source
    const contentUpper = rawContent.toUpperCase()
    
    let decision = false
    
    // Primary check: look for YES/NO in content field
    if (contentUpper.includes('YES')) {
      decision = true
    } else if (contentUpper.includes('NO')) {
      decision = false
    } else {
      // Fallback: if content is unclear, check reasoning
      const reasoningUpper = reasoning.toUpperCase()
      if (reasoningUpper.includes('YES') || reasoningUpper.includes('LIKELY YES')) {
        decision = true
      } else {
        decision = false
      }
    }
    
    console.log('🎯 Content decision:', contentUpper.includes('YES') ? 'YES' : contentUpper.includes('NO') ? 'NO' : 'UNCLEAR')
    console.log('🎯 Final decision:', decision ? 'YES' : 'NO')
    
    return decision
  } catch (error) {
    console.error('❌ Error analyzing tweet:', error)
    return false
  }
}