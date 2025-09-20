interface StatusIndicatorProps {
  isTwitterPage: boolean
  label?: string
}

export function StatusIndicator({ isTwitterPage, label }: StatusIndicatorProps) {
  return (
    <div className="status-indicator">
      <div className={`status-dot ${isTwitterPage ? 'connected' : 'disconnected'}`}></div>
      <span className="status-text">
        {label ?? (isTwitterPage ? 'Connected to X' : 'Open X/Twitter to continue')}
      </span>
    </div>
  )
}
