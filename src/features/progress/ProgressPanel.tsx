interface ProgressPanelProps {
  processedCount: number
  bookmarkedCount: number
  progressPercentage: number
  bookmarkRate: number
  isCompleted: boolean
}

export function ProgressPanel({ processedCount, bookmarkedCount, progressPercentage, bookmarkRate, isCompleted }: ProgressPanelProps) {
  return (
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

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        ></div>
      </div>

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
          <div className="stat-value rate">{Math.round(bookmarkRate)}%</div>
          <div className="stat-label">Hit Rate</div>
        </div>
      </div>
    </div>
  )
}
