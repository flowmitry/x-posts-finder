import { useCallback, useMemo } from 'react'
import { useProcessingContext } from '../../app/contexts/ProcessingContext'
import { useSettingsContext } from '../../app/contexts/SettingsContext'
import { ActionButton } from '../../components/ActionButton'
import { Header } from '../../components/Header'
import { ConfigurationForm } from '../configuration/ConfigurationForm'
import { ProgressPanel } from '../progress/ProgressPanel'

export function Popup() {
  const {
    settings,
    updateSettings,
    saveSettings
  } = useSettingsContext()

  const {
    isProcessing,
    isCompleted,
    processedCount,
    bookmarkedCount,
    startProcessing,
    stopProcessing,
    continueProcessing,
    startFromCurrentPosition,
    resetProcessing,
    isTwitterPage
  } = useProcessingContext()

  const persistSettings = useCallback(() => {
    void saveSettings()
  }, [saveSettings])

  const handleStart = useCallback(() => {
    void startProcessing()
  }, [startProcessing])

  const handleStop = useCallback(() => {
    void stopProcessing()
  }, [stopProcessing])

  const handleReset = useCallback(() => {
    resetProcessing()
  }, [resetProcessing])

  const handleContinue = useCallback(() => {
    void continueProcessing()
  }, [continueProcessing])

  const handleStartFromHere = useCallback(() => {
    void startFromCurrentPosition()
  }, [startFromCurrentPosition])

  const { progressPercentage, bookmarkRate } = useMemo(() => {
    const progress = settings.bookmarksLimit > 0
      ? (bookmarkedCount / settings.bookmarksLimit) * 100
      : 0

    const rate = processedCount > 0
      ? (bookmarkedCount / processedCount) * 100
      : 0

    return {
      progressPercentage: progress,
      bookmarkRate: rate
    }
  }, [bookmarkedCount, processedCount, settings.bookmarksLimit])

  const showProcessingState = isProcessing || isCompleted
  const hasBookmarksGoal = settings.bookmarksLimit > 0
  const hasReachedBookmarksGoal = hasBookmarksGoal && bookmarkedCount >= settings.bookmarksLimit
  const showContinueButton = isCompleted && !hasReachedBookmarksGoal
  const showStartFromHereButton = isCompleted && hasReachedBookmarksGoal

  return (
    <div className="x-posts-finder-container">
      <Header isProcessing={isProcessing} />

      <div className="x-posts-finder-content">
        {showProcessingState ? (
          <>
            <ProgressPanel
              processedCount={processedCount}
              bookmarkedCount={bookmarkedCount}
              progressPercentage={progressPercentage}
              bookmarkRate={bookmarkRate}
              isCompleted={isCompleted}
            />
            {isProcessing ? (
              <ActionButton
                onClick={handleStop}
                variant="stop"
              >
                Stop analysis
              </ActionButton>
            ) : (
              <>
                {showContinueButton && (
                  <ActionButton
                    onClick={handleContinue}
                    variant="start"
                  >
                    Continue
                  </ActionButton>
                )}

                {showStartFromHereButton && (
                  <ActionButton
                    onClick={handleStartFromHere}
                    variant="start"
                  >
                    Start from here
                  </ActionButton>
                )}

                <ActionButton
                  onClick={handleReset}
                >
                  Back to setup
                </ActionButton>
              </>
            )}
          </>
        ) : (
          <>
            {!isTwitterPage && (
              <div className="error-alert">
                <span className="error-icon">!</span>
                <p className="error-text">Please open X/Twitter to get started.</p>
              </div>
            )}

            <ConfigurationForm
              settings={settings}
              onUpdate={updateSettings}
              onPersist={persistSettings}
            />

            <ActionButton
              onClick={handleStart}
              disabled={!isTwitterPage}
              variant={isTwitterPage ? 'start' : 'default'}
            >
              {isTwitterPage ? 'Start' : 'Open X'}
            </ActionButton>
          </>
        )}
      </div>
    </div>
  )
}
