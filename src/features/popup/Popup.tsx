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

  const { progressPercentage, bookmarkRate } = useMemo(() => {
    const progress = settings.postLimit > 0
      ? (processedCount / settings.postLimit) * 100
      : 0

    const rate = processedCount > 0
      ? (bookmarkedCount / processedCount) * 100
      : 0

    return {
      progressPercentage: progress,
      bookmarkRate: rate
    }
  }, [bookmarkedCount, processedCount, settings.postLimit])

  const showProcessingState = isProcessing || isCompleted

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

            <ActionButton
              onClick={isCompleted ? handleReset : handleStop}
              variant={isCompleted ? 'start' : 'stop'}
            >
              {isCompleted ? 'Back to setup' : 'Stop analysis'}
            </ActionButton>
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
