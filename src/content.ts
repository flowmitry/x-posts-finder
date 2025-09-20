import type { Settings } from './types'

let isProcessing = false
let processedCount = 0
let bookmarkedCount = 0
let settings: Settings

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'START_PROCESSING') {
    settings = message.settings
    startProcessing()
  } else if (message.action === 'STOP_PROCESSING') {
    isProcessing = false
  }
  
  sendResponse({ success: true })
})

async function startProcessing() {
  isProcessing = true
  processedCount = 0
  bookmarkedCount = 0
  
  // Scroll to top first
  window.scrollTo(0, 0)
  await sleep(1000)
  
  const processedTweets = new Set<string>()
  
  while (isProcessing && processedCount < settings.postLimit) {
    // Find all tweet articles on the page
    const tweets = document.querySelectorAll('[data-testid="tweet"]')
    let newTweetsFound = false
    
    for (const tweet of tweets) {
      if (!isProcessing || processedCount >= settings.postLimit) break
      
      // Create a unique identifier for this tweet
      const tweetId = getTweetId(tweet as HTMLElement)
      if (!tweetId || processedTweets.has(tweetId)) continue
      
      processedTweets.add(tweetId)
      newTweetsFound = true
      
      try {
        const tweetText = extractTweetText(tweet as HTMLElement)
        if (tweetText) {
          // Check if tweet is already bookmarked
          if (isTweetBookmarked(tweet as HTMLElement)) {
            highlightTweet(tweet as HTMLElement, 'already_bookmarked')
            processedCount++
            
            // Send update to popup
            chrome.runtime.sendMessage({
              action: 'PROCESSING_UPDATE',
              processed: processedCount,
              bookmarked: bookmarkedCount
            })
            
            await sleep(200) // Short pause for already bookmarked
            continue
          }
          
          // Add processing indicator
          addProcessingIndicator(tweet as HTMLElement)
          
          // Scroll tweet into view
          tweet.scrollIntoView({ behavior: 'smooth', block: 'center' })
          await sleep(300)
          
          const shouldBookmark = await analyzeTweet(tweetText)
          if (shouldBookmark) {
            await bookmarkTweet(tweet as HTMLElement)
            highlightTweet(tweet as HTMLElement, 'bookmarked')
            bookmarkedCount++
            
            // Random pause after bookmarking (1-3 seconds)
            const randomPause = Math.floor(Math.random() * 2000) + 1000
            await sleep(randomPause)
          } else {
            highlightTweet(tweet as HTMLElement, 'rejected')
          }
          processedCount++
          
          // Send update to popup
          chrome.runtime.sendMessage({
            action: 'PROCESSING_UPDATE',
            processed: processedCount,
            bookmarked: bookmarkedCount
          })
          
          // Small delay to avoid overwhelming the API
          await sleep(500)
        }
      } catch (error) {
        console.error('Error processing tweet:', error)
        highlightTweet(tweet as HTMLElement, 'error')
      }
    }
    
    // If no new tweets found, scroll down to load more
    if (!newTweetsFound) {
      const currentScroll = window.scrollY
      window.scrollBy(0, window.innerHeight)
      await sleep(2000) // Wait for new content to load
      
      // If we didn't scroll (reached bottom), break
      if (window.scrollY === currentScroll) {
        console.log('Reached bottom of feed')
        break
      }
    }
  }
  
  isProcessing = false
  chrome.runtime.sendMessage({
    action: 'PROCESSING_COMPLETE',
    processed: processedCount,
    bookmarked: bookmarkedCount
  })
  
  console.log(`Processing complete. Processed: ${processedCount}, Bookmarked: ${bookmarkedCount}`)
}

function getTweetId(tweet: HTMLElement): string | null {
  // Try to find a link to the tweet
  const tweetLink = tweet.querySelector('a[href*="/status/"]') as HTMLAnchorElement
  if (tweetLink) {
    const match = tweetLink.href.match(/\/status\/(\d+)/)
    if (match) return match[1]
  }
  
  // Fallback: use the text content as identifier
  const tweetText = extractTweetText(tweet)
  return tweetText ? btoa(tweetText.substring(0, 100)) : null
}

function extractTweetText(tweet: HTMLElement): string | null {
  // Look for the tweet text in various possible selectors
  const textSelectors = [
    '[data-testid="tweetText"]',
    '[lang]', // Tweet text often has lang attribute
    '.css-1dbjc4n .css-901oao', // Twitter's CSS classes for text
  ]
  
  for (const selector of textSelectors) {
    const textElement = tweet.querySelector(selector)
    if (textElement && textElement.textContent) {
      return textElement.textContent.trim()
    }
  }
  
  // Fallback: try to get any text content from the tweet
  const textContent = tweet.textContent?.trim()
  if (textContent && textContent.length > 10) {
    // Remove common UI elements
    return textContent
      .replace(/^\d+h$|^\d+m$|^\d+s$/, '') // Remove time stamps
      .replace(/^@\w+/, '') // Remove usernames at start
      .trim()
  }
  
  return null
}

async function analyzeTweet(tweetText: string): Promise<boolean> {
  try {
    
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'ANALYZE_TWEET',
        tweetText: tweetText,
        settings: settings
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error sending message to background:', chrome.runtime.lastError.message)
          resolve(false)
          return
        }
        
        if (response.success) {
          resolve(response.shouldBookmark)
        } else {
          console.error('❌ Background analysis failed:', response.error)
          resolve(false)
        }
      })
    })
  } catch (error) {
    console.error('❌ Error in analyzeTweet:', error)
    return false
  }
}

async function bookmarkTweet(tweet: HTMLElement): Promise<void> {
  try {
    // Find the bookmark button (usually has a bookmark icon)
    const bookmarkButton = tweet.querySelector('[data-testid="bookmark"]') as HTMLElement
    if (bookmarkButton) {
      bookmarkButton.click()
      return
    }
    
    // Alternative: look for the "More" menu first, then bookmark
    const moreButton = tweet.querySelector('[data-testid="caret"]') as HTMLElement
    if (moreButton) {
      moreButton.click()
      await sleep(500)
      
      // Look for bookmark option in the dropdown
      const bookmarkOption = document.querySelector('[data-testid="bookmark"]') as HTMLElement
      if (bookmarkOption) {
        bookmarkOption.click()
        return
      }
    }
    
  } catch (error) {
    console.error('Error bookmarking tweet:', error)
  }
}

function addProcessingIndicator(tweet: HTMLElement): void {
  // Remove any existing indicators
  const existingIndicator = tweet.querySelector('.x-posts-finder-indicator')
  if (existingIndicator) {
    existingIndicator.remove()
  }
  
  // Add processing indicator
  const indicator = document.createElement('div')
  indicator.className = 'x-posts-finder-indicator'
  indicator.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    border: 2px solid #1DA1F2;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 1000;
    background: white;
  `
  
  // Add CSS animation if not already added
  if (!document.querySelector('#x-posts-finder-styles')) {
    const style = document.createElement('style')
    style.id = 'x-posts-finder-styles'
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .x-posts-finder-highlight {
        position: relative;
      }
      .x-posts-finder-highlight::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 3px solid;
        border-radius: 8px;
        pointer-events: none;
        z-index: 1;
      }
      .x-posts-finder-bookmarked::before {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
      }
      .x-posts-finder-rejected::before {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
      .x-posts-finder-error::before {
        border-color: #f97316;
        background: rgba(249, 115, 22, 0.1);
      }
      .x-posts-finder-already_bookmarked::before {
        border-color: #6b7280;
        background: rgba(107, 114, 128, 0.1);
      }
    `
    document.head.appendChild(style)
  }
  
  // Make tweet position relative if it's not already
  const tweetStyle = window.getComputedStyle(tweet)
  if (tweetStyle.position === 'static') {
    tweet.style.position = 'relative'
  }
  
  tweet.appendChild(indicator)
}

function isTweetBookmarked(tweet: HTMLElement): boolean {
  try {
    // Look for bookmark button that's already activated
    const bookmarkButton = tweet.querySelector('[data-testid="bookmark"]') as HTMLElement
    if (bookmarkButton) {
      // Check if the bookmark button has "filled" or "active" styling
      const buttonSvg = bookmarkButton.querySelector('svg')
      if (buttonSvg) {
        // Bookmarked tweets usually have a filled bookmark icon
        const isBookmarked = buttonSvg.outerHTML.includes('fill') || 
                           (bookmarkButton.getAttribute('aria-label')?.toLowerCase().includes('remove') ?? false) ||
                           (bookmarkButton.getAttribute('data-testid')?.includes('unbookmark') ?? false)
        return isBookmarked
      }
    }
    
    // Alternative check: look for "unbookmark" or "remove bookmark" text/attributes
    const unbookmarkButton = tweet.querySelector('[data-testid="unbookmark"]')
    if (unbookmarkButton) {
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error checking bookmark status:', error)
    return false
  }
}

function highlightTweet(tweet: HTMLElement, type: 'bookmarked' | 'rejected' | 'error' | 'already_bookmarked'): void {
  // Remove processing indicator
  const indicator = tweet.querySelector('.x-posts-finder-indicator')
  if (indicator) {
    indicator.remove()
  }
  
  // Ensure previous highlight classes are cleared before applying the new state
  tweet.classList.remove(
    'x-posts-finder-highlight',
    'x-posts-finder-bookmarked',
    'x-posts-finder-rejected',
    'x-posts-finder-error',
    'x-posts-finder-already_bookmarked',
    'x-comment-finder-highlight',
    'x-comment-finder-bookmarked',
    'x-comment-finder-rejected',
    'x-comment-finder-error',
    'x-comment-finder-already_bookmarked'
  )

  // Add highlight class
  tweet.classList.add('x-posts-finder-highlight', `x-posts-finder-${type}`)
  
  // Add status badge
  const existingBadge = tweet.querySelector('.x-posts-finder-badge')
  if (existingBadge) {
    existingBadge.remove()
  }

  const badge = document.createElement('div')
  badge.className = 'x-posts-finder-badge'
  badge.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    z-index: 1000;
    pointer-events: none;
  `
  
  switch (type) {
    case 'bookmarked':
      badge.textContent = '✓ BOOKMARKED'
      badge.style.backgroundColor = '#22c55e'
      break
    case 'rejected':
      badge.textContent = '✗ REJECTED'
      badge.style.backgroundColor = '#ef4444'
      break
    case 'error':
      badge.textContent = '⚠ ERROR'
      badge.style.backgroundColor = '#f97316'
      break
    case 'already_bookmarked':
      badge.textContent = '📌 ALREADY SAVED'
      badge.style.backgroundColor = '#6b7280'
      break
  }
  
  tweet.appendChild(badge)
  
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
