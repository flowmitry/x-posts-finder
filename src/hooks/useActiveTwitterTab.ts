import { useCallback, useEffect, useState } from 'react'
import { getActiveTab } from '../lib/chrome'
import { TWITTER_DOMAINS } from '../lib/constants'

export function useActiveTwitterTab() {
  const [isTwitterPage, setIsTwitterPage] = useState(false)

  const refreshStatus = useCallback(async () => {
    const tab = await getActiveTab()
    const url = tab?.url ?? ''
    const onTwitter = TWITTER_DOMAINS.some((domain) => url.includes(domain))
    setIsTwitterPage(onTwitter)
    return onTwitter
  }, [])

  useEffect(() => {
    void refreshStatus()
  }, [refreshStatus])

  return { isTwitterPage, refreshStatus }
}
