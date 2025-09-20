import { StatusIndicator } from './StatusIndicator'

interface HeaderProps {
  isProcessing: boolean
  isTwitterPage: boolean
}

export function Header({ isProcessing, isTwitterPage }: HeaderProps) {
  return (
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

      <StatusIndicator isTwitterPage={isTwitterPage} />
    </div>
  )
}
